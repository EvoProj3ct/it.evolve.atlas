// /models/filament.js
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongo';

const COLLECTION = 'filaments';

// Validator JSON Schema per MongoDB (server-side)
const FILAMENT_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['material', 'color', 'brand', 'weightKg', 'cost', 'user', 'createdAt', 'updatedAt'],
        additionalProperties: false,
        properties: {
            _id: { bsonType: 'objectId' },
            material: { bsonType: 'string', description: 'Es. PLA, PETG...' },
            color: { bsonType: 'string', description: 'Es. Rosso' },
            brand: { bsonType: 'string', description: 'Es. eSun' },
            weightKg: { bsonType: ['double', 'int', 'long', 'decimal'], description: 'Peso in Kg' },
            cost: { bsonType: ['double', 'int', 'long', 'decimal'], description: 'Costo (valuta base)' },
            user: { bsonType: 'string', description: 'Username proprietario' },
            userId: { bsonType: ['objectId', 'null'], description: 'Riferimento utente (opzionale)' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
        }
    }
};

let ensured = false;

/**
 * Garantisce che la collection esista con validator e indici.
 */
async function ensureCollection(db) {
    if (ensured) return;
    const collections = await db.listCollections({ name: COLLECTION }).toArray();
    if (collections.length === 0) {
        // Crea la collection con validator
        await db.createCollection(COLLECTION, { validator: FILAMENT_VALIDATOR });
    } else {
        // Aggiorna il validator se necessario
        await db.command({
            collMod: COLLECTION,
            validator: FILAMENT_VALIDATOR,
            validationLevel: 'moderate'
        });
    }
    // Indici utili
    const col = db.collection(COLLECTION);
    await col.createIndex({ createdAt: -1 });
    await col.createIndex(
        { user: 1, brand: 1, material: 1, color: 1 },
        { name: 'lookup_user_brand_material_color' }
    );
    ensured = true;
}

/**
 * Accessor della collection garantita.
 */
export async function getFilamentsCollection() {
    const client = await clientPromise;
    const db = client.db();
    await ensureCollection(db);
    return db.collection(COLLECTION);
}

/**
 * Normalizza/valida a livello applicativo (coercion & defaults).
 * Affida la validazione hard al validator MongoDB.
 */
export function buildFilament(input = {}) {
    const now = new Date();

    const toNum = (v) => {
        if (v === null || v === undefined || v === '') return undefined;
        const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    const doc = {
        material: input.material?.trim(),
        color: input.color?.trim(),
        brand: input.brand?.trim(),
        weightKg: toNum(input.weightKg),
        cost: toNum(input.cost),
        user: input.user?.trim(),
        userId:
            input.userId == null || input.userId === ''
                ? null
                : (ObjectId.isValid(input.userId) ? new ObjectId(input.userId) : null),
        createdAt: input.createdAt ? new Date(input.createdAt) : now,
        updatedAt: input.updatedAt ? new Date(input.updatedAt) : now
    };

    // Rimuovi undefined per lasciare che il validator faccia il suo lavoro
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);

    return doc;
}
