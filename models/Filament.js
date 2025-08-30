// Modello "Filament" - rotoli di filamento (PLA/PETG/...)
export async function createFilament(doc) {
    const { default: clientPromise } = await import('@/utils/mongo');
    const client = await clientPromise;
    const db = client.db();
    const res = await db.collection('filaments').insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

export async function listFilaments({ limit = 50 } = {}) {
    const { default: clientPromise } = await import('@/utils/mongo');
    const client = await clientPromise;
    const db = client.db();
    return db
        .collection('filaments')
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}
