// /repositories/note.js
import { ObjectId } from 'mongodb';
import { getNotesCollection, buildNote } from '@/model/ModelNote';

// Crea nota
export async function createNote(data) {
    const col = await getNotesCollection();
    const doc = buildNote(data);
    const res = await col.insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

// Lista note (più recenti prima)
export async function listNotes({ limit = 100 } = {}) {
    const col = await getNotesCollection();
    return col.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

// Marca come risolta
export async function resolveNote(id, { resolvedBy }) {
    const col = await getNotesCollection();
    const now = new Date();
    const res = await col.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
            $set: {
                status: 'resolved',
                resolvedBy: resolvedBy ?? null,
                resolvedAt: now,
                updatedAt: now
            }
        },
        { returnDocument: 'after' }
    );
    return res.value;
}

// Append di testo alla descrizione (con separatore e timestamp locale)
export async function appendToDescription(id, text) {
    const col = await getNotesCollection();
    const now = new Date();
    const appendBlock = `\n\n— ${now.toLocaleString()} —\n${text}`;

    // 1) Tentativo con pipeline update (MongoDB 4.2+)
    try {
        const res = await col.findOneAndUpdate(
            { _id: new ObjectId(id) },
            [
                {
                    $set: {
                        description: {
                            $concat: [
                                { $ifNull: ['$description', ''] },
                                appendBlock
                            ]
                        },
                        updatedAt: '$$NOW'
                    }
                }
            ],
            { returnDocument: 'after' }
        );
        if (res?.value) return res.value;
    } catch (_) {
        // se il server non supporta pipeline update, fallback sotto
    }

    // 2) Fallback: leggi → concatena → salva
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) return null;

    const merged = {
        ...doc,
        description: (doc.description || '') + appendBlock,
        updatedAt: now
    };
    await col.updateOne({ _id: doc._id }, { $set: { description: merged.description, updatedAt: merged.updatedAt } });
    return merged;
}
