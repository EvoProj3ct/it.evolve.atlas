import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { default: clientPromise } = await import('@/utils/mongo')
        const client = await clientPromise
        const user = await client.db().collection('users').findOne({ email: credentials.email })
        if (user && await compare(credentials.password, user.password)) {
          return { id: user._id.toString(), email: user.email }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login-failed'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
