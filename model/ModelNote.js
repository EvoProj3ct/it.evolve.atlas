// /models/note.js
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongo';

const COLLECTION = 'notes';

// JSON Schema validator lato MongoDB
const NOTE_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'status', 'createdBy', 'createdAt', 'updatedAt'],
        additionalProperties: false,
        properties: {
            _id: { bsonType: 'objectId' },
            title: { bsonType: 'string', description: 'Titolo breve' },
            description: { bsonType: ['string', 'null'], description: 'Testo descrittivo' },
            hasAmount: { bsonType: ['bool', 'null'], description: 'Flag presenza amount' },
            amount: { bsonType: ['double', 'int', 'long', 'decimal', 'null'], description: 'Valore numerico' },
            status: { bsonType: 'string', enum: ['open', 'resolved'], description: 'Stato nota' },
            createdBy: { bsonType: 'string', description: 'Username creatore' },
            createdById: { bsonType: ['objectId', 'null'], description: 'Rif. utente (opz.)' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
            resolvedAt: { bsonType: ['date', 'null'] },
            resolvedBy: { bsonType: ['string', 'null'] }
        }
    }
};

let ensured = false;

async function ensureCollection(db) {
    if (ensured) return;
    const exists = await db.listCollections({ name: COLLECTION }).toArray();
    if (exists.length === 0) {
        await db.createCollection(COLLECTION, { validator: NOTE_VALIDATOR });
    } else {
        await db.command({
            collMod: COLLECTION,
            validator: NOTE_VALIDATOR,
            validationLevel: 'moderate'
        });
    }
    const col = db.collection(COLLECTION);
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ status: 1, createdAt: -1 }, { name: 'by_status_createdAt' });
    await col.createIndex({ createdBy: 1, createdAt: -1 }, { name: 'by_user_createdAt' });
    ensured = true;
}

/** Accessor della collection garantita */
export async function getNotesCollection() {
    const client = await clientPromise;
    const db = client.db();
    await ensureCollection(db);
    return db.collection(COLLECTION);
}

/** Normalizzazione/coercion + default timestamp */
export function buildNote(input = {}) {
    const now = new Date();

    const toNum = (v) => {
        if (v === null || v === undefined || v === '') return null;
        const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
        return Number.isFinite(n) ? n : null;
    };

    const toBool = (v) => {
        if (v === null || v === undefined || v === '') return null;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            if (['true', '1', 'yes', 'y', 'on'].includes(s)) return true;
            if (['false', '0', 'no', 'n', 'off'].includes(s)) return false;
        }
        if (typeof v === 'number') return v !== 0;
        return null;
    };

    const status =
        (input.status ?? 'open').toString().trim().toLowerCase() === 'resolved'
            ? 'resolved'
            : 'open';

    const doc = {
        title: input.title?.toString().trim(),
        description:
            input.description == null ? null : input.description.toString(),
        hasAmount: toBool(input.hasAmount),
        amount: toNum(input.amount),
        status,
        createdBy: input.createdBy?.toString().trim(),
        createdById:
            input.createdById == null || input.createdById === ''
                ? null
                : (ObjectId.isValid(input.createdById) ? new ObjectId(input.createdById) : null),
        createdAt: input.createdAt ? new Date(input.createdAt) : now,
        updatedAt: input.updatedAt ? new Date(input.updatedAt) : now,
        resolvedAt: input.resolvedAt ? new Date(input.resolvedAt) : null,
        resolvedBy:
            input.resolvedBy == null ? null : input.resolvedBy.toString().trim()
    };

    // ripulisci undefined
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
}
