import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/utils";

export const { handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Create or update user in database
      if (user && token.sub) {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        
        if (!existingUser) {
          // Auto-assign admin role if email is in ADMIN_EMAILS
          const role = user.email && isAdminEmail(user.email) ? "admin" : "user";
          
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
              role, // Update role if changed
            },
            create: {
              id: token.sub,
              name: user.name,
              email: user.email,
              image: user.image,
              role,
            },
          });
          
          token.role = role;
        } else {
          // Check if role needs to be updated (for existing users)
          const expectedRole = user.email && isAdminEmail(user.email) ? "admin" : "user";
          if (existingUser.role !== expectedRole) {
            await prisma.user.update({
              where: { id: token.sub },
              data: { role: expectedRole },
            });
            token.role = expectedRole;
          } else {
            token.role = existingUser.role;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
