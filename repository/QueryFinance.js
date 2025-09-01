// /repositories/finance.js (ex QueryFinance.js)
import { getFinancesCollection, buildFinance } from '@/model/ModelFinance';

export async function createFinance(data) {
    const col = await getFinancesCollection();
    const doc = buildFinance(data);
    const res = await col.insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

export async function listFinances({ limit = 300 } = {}) {
    const col = await getFinancesCollection();
    return col
        .find({})
        .sort({ createdAt: -1 }) // più recenti in alto
        .limit(limit)
        .toArray();
}
