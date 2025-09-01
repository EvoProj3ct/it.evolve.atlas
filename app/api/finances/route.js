import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createFinance, listFinances } from "@/repository/QueryFinance";

function sanitize(body) {
    const out = {};
    const t = (body.type || "expense").toString();
    out.type = t === "income" ? "income" : "expense";
    out.title = (body.title || "").toString().trim();
    out.reason = (body.reason || "").toString().trim();
    out.amount = Math.max(0, Number(body.amount || 0));
    return out;
}

export async function GET() {
    const items = await listFinances({ limit: 300 });
    return NextResponse.json(items);
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const data = sanitize(body);
    if (!data.title || !data.reason || !data.amount) {
        return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const now = new Date();
    const doc = {
        ...data,
        createdBy: session.user?.name || session.user?.email || "unknown",
        createdById: session.user?.email || null,
        createdAt: now,
        updatedAt: now,
    };

    const created = await createFinance(doc);
    return NextResponse.json(created, { status: 201 });
}
