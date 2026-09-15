import type { NextAuthConfig } from "next-auth";
import { resolveAuthSecret } from "@/lib/authSecret";

export const authConfig = {
  secret: resolveAuthSecret(),
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
} satisfies NextAuthConfig;
