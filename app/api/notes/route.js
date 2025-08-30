import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createNote, listNotes, resolveNote, appendToDescription } from "@/models/Note";

function sanitizeCreate(body) {
    const out = {};
    out.title = (body.title || "").toString().trim();
    out.description = (body.description || "").toString().trim();
    out.hasAmount = Boolean(body.hasAmount);
    out.amount = out.hasAmount ? Math.max(0, Number(body.amount || 0)) : null;
    return out;
}

export async function GET() {
    const items = await listNotes({ limit: 200 });
    return NextResponse.json(items);
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const data = sanitizeCreate(body);
    if (!data.title || !data.description) {
        return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const now = new Date();
    const doc = {
        ...data,
        status: "pending",
        createdBy: session.user?.name || session.user?.email || "unknown",
        createdById: session.user?.email || null,
        createdAt: now,
        updatedAt: now,
    };

    const created = await createNote(doc);
    return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = body.id;
    const action = (body.action || "").toString();

    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    if (action === "resolve") {
        const updated = await resolveNote(id, {
            resolvedBy: session.user?.name || session.user?.email || "unknown",
        });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    }

    if (action === "append") {
        const text = (body.text || "").toString().trim();
        if (!text) return NextResponse.json({ error: "Nessun testo" }, { status: 400 });
        const updated = await appendToDescription(id, text);
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Azione non supportata" }, { status: 400 });
}
