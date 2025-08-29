// models/User.js (driver nativo)
export async function getUsersCollection() {
  const { default: clientPromise } = await import('@/utils/mongo')
  const client = await clientPromise
  const db = client.db()
  const col = db.collection('users')
  // indice unico su user per sicurezza
  await col.createIndex({ user: 1 }, { unique: true })
  return col
}

export async function findUserByUsername(username) {
  const col = await getUsersCollection()
  return col.findOne({ user: username })
}

export async function createUser({ user, password, role = 'user' }) {
  const col = await getUsersCollection()
  const res = await col.insertOne({ user, password, role })
  return { _id: res.insertedId, user, role }
}

export async function upsertManyUsers(users) {
  const col = await getUsersCollection()
  const ops = users.map(u => ({
    updateOne: {
      filter: { user: u.user },
      update: { $setOnInsert: { user: u.user, password: u.password, role: u.role || 'user' } },
      upsert: true
    }
  }))
  const res = await col.bulkWrite(ops, { ordered: false })
  return res
}
