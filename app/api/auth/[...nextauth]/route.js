import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { findUserByUsername } from '@/repository/QueryUser'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,   // <— IMPORTANTE
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        user: { label: 'User', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.user || !credentials?.password) return null
        const user = await findUserByUsername(credentials.user)
        if (!user) return null
        const ok = await compare(credentials.password, user.password)
        if (!ok) return null
        return { id: String(user._id), user: user.user, role: user.role || 'user' }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.name = user.user   // username in sessione
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.name = token.name
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login-failed'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
