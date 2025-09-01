// /models/user.js
import clientPromise from '@/utils/mongo';

const COLLECTION = 'users';

// JSON Schema validator (server-side)
const USER_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['user', 'password', 'role', 'createdAt', 'updatedAt'],
        additionalProperties: false,
        properties: {
            _id: { bsonType: 'objectId' },
            user: { bsonType: 'string', description: 'username univoco' },
            password: { bsonType: 'string', description: 'hash della password (es. bcrypt)' },
            role: { bsonType: 'string', enum: ['user', 'admin'], description: 'ruolo' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
        }
    }
};

let ensured = false;

async function ensureCollection(db) {
    if (ensured) return;
    const exists = await db.listCollections({ name: COLLECTION }).toArray();
    if (exists.length === 0) {
        await db.createCollection(COLLECTION, { validator: USER_VALIDATOR });
    } else {
        await db.command({
            collMod: COLLECTION,
            validator: USER_VALIDATOR,
            validationLevel: 'moderate'
        });
    }
    const col = db.collection(COLLECTION);
    await col.createIndex({ user: 1 }, { unique: true, name: 'uniq_username' });
    ensured = true;
}

/** Accessor della collection con validator/indici garantiti */
export async function getUsersCollection() {
    const client = await clientPromise;
    const db = client.db();
    await ensureCollection(db);
    return db.collection(COLLECTION);
}

/** Normalizzazione/coercion + default timestamp */
export function buildUser(input = {}) {
    const now = new Date();
    const role =
        (input.role ?? 'user').toString().trim().toLowerCase() === 'admin'
            ? 'admin'
            : 'user';

    const doc = {
        user: input.user?.toString().trim(),
        password: input.password?.toString(), // atteso già HASH (non in chiaro)
        role,
        createdAt: input.createdAt ? new Date(input.createdAt) : now,
        updatedAt: input.updatedAt ? new Date(input.updatedAt) : now
    };

    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
}
