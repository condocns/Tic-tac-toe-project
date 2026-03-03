import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/utils";
import { getOptionalEnv } from "@/lib/env";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isSessionBlacklistedSafe } from "@/lib/session-blacklist";

const googleClientId = getOptionalEnv("AUTH_GOOGLE_ID");
const googleClientSecret = getOptionalEnv("AUTH_GOOGLE_SECRET");
const githubClientId = getOptionalEnv("AUTH_GITHUB_ID");
const githubClientSecret = getOptionalEnv("AUTH_GITHUB_SECRET");

const providers: Provider[] = [
  // Credentials provider disabled for security - OAuth 2.0 only
  // To enable: uncomment the provider below and add CREDENTIALS_ENABLED=true to env
];

const credentialsEnabled = getOptionalEnv("CREDENTIALS_ENABLED") === "true";

if (credentialsEnabled) {
  providers.push(
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      }
    })
  );
}

if (googleClientId && googleClientSecret) {
  providers.unshift(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

if (githubClientId && githubClientSecret) {
  providers.unshift(
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in or user object provided
        token.sub = user.id;
        
        // Auto-assign admin role if email is in ADMIN_EMAILS
        const expectedRole = user.email && isAdminEmail(user.email) ? UserRole.ADMIN : UserRole.USER;
        
        // Clear blacklist on new login
        if (user.email) {
          const { clearSessionBlacklist } = await import("@/lib/session-blacklist");
          await clearSessionBlacklist(user.id, user.email);
        }
        
        // For OAuth users, create/update user in DB asynchronously
        if (user.email && !('password' in user)) {
          prisma.user.upsert({
            where: { email: user.email },
            update: { 
              name: user.name,
              image: user.image,
              role: expectedRole,
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: expectedRole,
            },
          }).catch(console.error);
        }
        
        token.role = expectedRole;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const isBlacklisted = await isSessionBlacklistedSafe(token.sub, 75, token.email || undefined);
        if (isBlacklisted) {
          throw new Error("Session revoked");
        }

        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) ?? UserRole.USER;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
    updateAge: 5 * 60, // Update every 5 minutes
  },
  events: {
    async signOut(params: any) {
      // Blacklist session on logout
      const userId = params.session?.user?.id || params.token?.sub;
      if (userId) {
        const { blacklistSession } = await import("@/lib/session-blacklist");
        await blacklistSession(userId);
      }
    },
  },
});
