// es: /repositories/filament.js (la tua "Pagina js Filament Query")
import { getFilamentsCollection, buildFilament } from '@/model/ModelFilament';

export async function createFilament(data) {
    const col = await getFilamentsCollection();
    const doc = buildFilament(data);
    const res = await col.insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

export async function listFilaments({ limit = 50 } = {}) {
    const col = await getFilamentsCollection();
    return col.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}
