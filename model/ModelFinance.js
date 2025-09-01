// /models/finance.js
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongo';

const COLLECTION = 'finances';

// Validator JSON Schema lato MongoDB
const FINANCE_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['type', 'title', 'amount', 'createdBy', 'createdAt', 'updatedAt'],
        additionalProperties: false,
        properties: {
            _id: { bsonType: 'objectId' },
            type: { bsonType: 'string', description: 'es. "expense", "income"' },
            title: { bsonType: 'string', description: 'titolo breve' },
            reason: { bsonType: ['string', 'null'], description: 'descrizione estesa (opzionale)' },
            amount: { bsonType: ['double', 'int', 'long', 'decimal'], description: 'importo' },
            createdBy: { bsonType: 'string', description: 'username autore' },
            createdById: { bsonType: ['objectId', 'null'], description: 'ObjectId utente (opzionale)' },
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
        await db.createCollection(COLLECTION, { validator: FINANCE_VALIDATOR });
    } else {
        await db.command({
            collMod: COLLECTION,
            validator: FINANCE_VALIDATOR,
            validationLevel: 'moderate'
        });
    }
    const col = db.collection(COLLECTION);
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ type: 1, createdAt: -1 }, { name: 'by_type_createdAt' });
    await col.createIndex({ createdBy: 1, createdAt: -1 }, { name: 'by_user_createdAt' });
    ensured = true;
}

export async function getFinancesCollection() {
    const client = await clientPromise;
    const db = client.db();
    await ensureCollection(db);
    return db.collection(COLLECTION);
}

// Normalizzazione/coercion + default timestamp
export function buildFinance(input = {}) {
    const now = new Date();

    const toNum = (v) => {
        if (v === null || v === undefined || v === '') return undefined;
        const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    const doc = {
        type: input.type?.trim(),            // "expense" | "income" | altro
        title: input.title?.trim(),
        reason: input.reason == null ? null : String(input.reason).trim(),
        amount: toNum(input.amount),
        createdBy: input.createdBy?.trim(),
        createdById:
            input.createdById == null || input.createdById === ''
                ? null
                : (ObjectId.isValid(input.createdById) ? new ObjectId(input.createdById) : null),
        createdAt: input.createdAt ? new Date(input.createdAt) : now,
        updatedAt: input.updatedAt ? new Date(input.updatedAt) : now
    };

    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
}
