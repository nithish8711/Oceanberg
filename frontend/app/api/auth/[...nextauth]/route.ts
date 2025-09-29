import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: credentials?.userId,   // ✅ FIXED
              password: credentials?.password,
            }),
          })

          if (!res.ok) return null
          const user = await res.json()

          // Backend response: { token, userId, email, roles }
          return {
            id: user.userId,
            userId: user.userId,
            email: user.email,
            role: user.roles.includes("ROLE_ADMIN")
              ? "admin"
              : user.roles.includes("ROLE_ANALYTICS")
              ? "analytics"
              : "user",
            accessToken: user.token,
          }
        } catch (err) {
          console.error("Login failed", err)
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.userId
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.accessToken = token.accessToken
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
