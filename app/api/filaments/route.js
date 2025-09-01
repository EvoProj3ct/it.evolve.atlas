import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { createFilament, listFilaments } from '@/repository/QueryFilament';

// piccola validazione base
function sanitize(body) {
    const out = {};
    out.material = (body.material || 'PLA').toString().trim().toUpperCase(); // PLA/PETG/…
    out.color = (body.color || '').toString().trim();                        // es: Nero
    out.brand = (body.brand || '').toString().trim();                        // es: eSun
    out.weightKg = Math.max(0, Number(body.weightKg || 0));                  // es: 1
    out.cost = Math.max(0, Number(body.cost || 0));                          // es: 19.90
    return out;
}

export async function GET() {
    const items = await listFilaments({ limit: 100 });
    return NextResponse.json(items);
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const data = sanitize(body);

    if (!data.color || !data.brand || !data.weightKg) {
        return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const now = new Date();
    const doc = {
        ...data,
        user: session.user?.name || session.user?.email || 'unknown',
        userId: session.user?.email || null,
        createdAt: now,
        updatedAt: now,
    };

    const created = await createFilament(doc);
    return NextResponse.json(created, { status: 201 });
}
