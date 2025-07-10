import clientPromise from '@/utils/mongo'

export async function findUserByUsername(username) {
  const client = await clientPromise
  return client.db().collection('users').findOne({ user: username })
}
