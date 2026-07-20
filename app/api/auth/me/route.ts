import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLibrary } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, library: [] });
  const lib = await getLibrary(user.id);
  const library = lib.map((e) => ({ key: e.key, status: e.status, rating: e.rating }));
  return NextResponse.json({ user, library });
}
