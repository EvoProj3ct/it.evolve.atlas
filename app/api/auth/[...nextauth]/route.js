import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { findUserByUsername } from '@/models/User'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        user: { label: 'User', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await findUserByUsername(credentials.user)
        if (user && await compare(credentials.password, user.password)) {
          return { id: user._id.toString(), user: user.user, role: user.role }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.name = user.user       // <— importante per saluto
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.name = token.name // <— salveremo qui lo username
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
