import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isSessionBlacklisted } from "@/lib/session-blacklist";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true, // implement later for email verification
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true, // implement later for email verification
    }),
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
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in or user object provided
        token.sub = user.id;
        
        // Auto-assign admin role if email is in ADMIN_EMAILS
        const expectedRole = user.email && isAdminEmail(user.email) ? UserRole.ADMIN : UserRole.USER;
        
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Temporarily disable blacklist check for performance
        // TODO: Re-enable when performance is stable
        
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
