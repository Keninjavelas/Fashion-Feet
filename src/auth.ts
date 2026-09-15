import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import { verifyPassword, hashPassword } from "@/lib/password"
import { resolveAuthSecret } from "@/lib/authSecret"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: resolveAuthSecret(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const rawEmail = (credentials.email as string).trim().toLowerCase();
        const rawPassword = (credentials.password as string).trim();

        const user = await prisma.user.findFirst({
          where: { 
            email: {
              equals: rawEmail
            } 
          }
        });

        if (!user || user.active === false || !user.password) return null;

        const check = await verifyPassword(rawPassword, user.password);
        if (check.valid) {
          // Transparently upgrade legacy passwords to Argon2id
          if (check.needsRehash) {
            const upgraded = await hashPassword(rawPassword);
            await prisma.user.update({
              where: { id: user.id },
              data: { password: upgraded }
            }).catch(() => {});
          }
          return { id: user.id, name: user.name, email: user.email, role: user.role }
        }
        
        return null
      }
    })
  ]
})
