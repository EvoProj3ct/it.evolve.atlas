export async function findUserByUsername(username) {
  const { default: clientPromise } = await import('@/utils/mongo')
  const client = await clientPromise
  return client.db().collection('users').findOne({ user: username })
}
