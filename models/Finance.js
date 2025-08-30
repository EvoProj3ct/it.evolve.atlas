export async function createFinance(doc) {
    const { default: clientPromise } = await import("@/utils/mongo");
    const client = await clientPromise;
    const db = client.db();
    const res = await db.collection("finances").insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

export async function listFinances({ limit = 300 } = {}) {
    const { default: clientPromise } = await import("@/utils/mongo");
    const client = await clientPromise;
    const db = client.db();
    return db
        .collection("finances")
        .find({})
        .sort({ createdAt: -1 }) // più recenti in alto nell’elenco
        .limit(limit)
        .toArray();
}
