// /repositories/user.js
import { getUsersCollection, buildUser } from '@/model/ModelUser';

/** Trova utente per username (ritorna anche l'hash password) */
export async function findUserByUsername(username) {
    const col = await getUsersCollection();
    return col.findOne({ user: username });
}

/** Crea utente (non restituisce l’hash in output) */
export async function createUser({ user, password, role = 'user' }) {
    const col = await getUsersCollection();
    const doc = buildUser({ user, password, role });
    const res = await col.insertOne(doc);
    return { _id: res.insertedId, user: doc.user, role: doc.role };
}

/** Upsert in bulk (setOnInsert per creare soltanto i mancanti) */
export async function upsertManyUsers(users) {
    const col = await getUsersCollection();
    const ops = users.map((u) => {
        const toInsert = buildUser({
            user: u.user,
            password: u.password,
            role: u.role ?? 'user'
        });
        return {
            updateOne: {
                filter: { user: toInsert.user },
                update: { $setOnInsert: toInsert },
                upsert: true
            }
        };
    });
    return col.bulkWrite(ops, { ordered: false });
}
