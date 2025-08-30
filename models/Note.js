import { ObjectId } from "mongodb";

// Crea nota
export async function createNote(doc) {
    const { default: clientPromise } = await import("@/utils/mongo");
    const client = await clientPromise;
    const db = client.db();
    const res = await db.collection("notes").insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

// Lista note (più recenti prima)
export async function listNotes({ limit = 100 } = {}) {
    const { default: clientPromise } = await import("@/utils/mongo");
    const client = await clientPromise;
    const db = client.db();
    return db
        .collection("notes")
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

// Marca come risolta
export async function resolveNote(id, { resolvedBy }) {
    const { default: clientPromise } = await import("@/utils/mongo");
    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    const res = await db.collection("notes").findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
            $set: {
                status: "resolved",
                resolvedBy,
                resolvedAt: now,
                updatedAt: now,
            },
        },
        { returnDocument: "after" }
    );
    return res.value;
}

// Append solo testo alla descrizione
export async function appendToDescription(id, text) {
    const { default: clientPromise } = await import("@/utils/mongo");
    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    // separatore “—” + timestamp
    const appendBlock = `\n\n— ${now.toLocaleString()} —\n${text}`;

    const res = await db.collection("notes").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { updatedAt: now }, $push: {} }, // placeholder per evitare driver warnings
        { returnDocument: "after" }
    );

    // serve un secondo update per concatenare in sicurezza
    const updated = await db.collection("notes").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { updatedAt: now }, $concat: {} }
    );

    // fallback semplice: concateno con $set descrizione + append
    const doc = await db.collection("notes").findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    const merged = {
        ...doc,
        description: (doc.description || "") + appendBlock,
        updatedAt: now,
    };
    await db.collection("notes").updateOne({ _id: doc._id }, { $set: merged });
    return merged;
}
