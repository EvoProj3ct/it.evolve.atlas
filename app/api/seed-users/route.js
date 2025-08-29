import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { findUserByUsername, createUser } from '@/models/User'

const USERS = [
    { user: 'emanuele',  pass: 'emanuele',  role: 'user' },
    { user: 'lucam',     pass: 'lucam',     role: 'user' },
    { user: 'lucad',     pass: 'lucad',     role: 'user' },
    { user: 'gianmarco', pass: 'gianmarco', role: 'user' },
]

export async function POST() {
    // opzionale: blocca in prod (togli se lo vuoi attivo)
    // if (process.env.NODE_ENV === 'production') {
    //   return NextResponse.json({ ok:false, error: 'Seeding disabilitato in produzione' }, { status: 403 })
    // }

    const results = []

    for (const { user, pass, role } of USERS) {
        const existing = await findUserByUsername(user)
        if (existing) {
            results.push({ user, status: 'exists' })
            continue
        }
        const hash = await bcrypt.hash(pass, 10)
        const created = await createUser({ user, password: hash, role })
        results.push({ user, status: 'created', id: created._id.toString() })
    }

    return NextResponse.json({ ok: true, results })
}
