import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import User from '@/models/User'                    // <-- il tuo model mongoose
import { findUserByUsername } from '@/models/User' // <-- già usato da te (manteniamo)

const USERS = [
    { user: 'emanuele',  pass: 'emanuele',  role: 'user' },
    { user: 'lucam',     pass: 'lucam',     role: 'user' },
    { user: 'lucad',     pass: 'lucad',     role: 'user' },
    { user: 'gianmarco', pass: 'gianmarco', role: 'user' },
]

// Se hai una utility di connessione al DB, importala e chiamala qui.
// Esempio: import dbConnect from '@/lib/dbConnect';  poi: await dbConnect();

export async function POST() {
    // sicurezza minimale: disattiva in produzione
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { ok: false, error: 'Seeding disabilitato in produzione.' },
            { status: 403 }
        )
    }

    const results = []
    for (const { user, pass, role } of USERS) {
        const existing = await findUserByUsername(user)
        if (existing) {
            results.push({ user, status: 'exists' })
            continue
        }
        const hash = await bcrypt.hash(pass, 10)
        const created = await User.create({ user, password: hash, role })
        results.push({ user, status: 'created', id: created._id.toString() })
    }

    return NextResponse.json({ ok: true, results })
}
