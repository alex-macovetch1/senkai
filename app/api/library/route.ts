import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLibrary, upsertEntry, removeEntry } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ entries: await getLibrary(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body?.media || (!body.media.id && !body.media.idMal)) {
    return NextResponse.json({ error: "media required" }, { status: 400 });
  }
  const entry = await upsertEntry(user.id, body.media, { status: body.status, rating: body.rating });
  return NextResponse.json({ entry });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = new URL(req.url).searchParams.get("key");
  if (key) await removeEntry(user.id, key);
  return NextResponse.json({ ok: true });
}
