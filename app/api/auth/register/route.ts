import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createUser, createSession, findUserByUsername, seedLibrary, entryKey, type LibEntry } from "@/lib/db";
import { hashPassword, newToken, SESSION_COOKIE } from "@/lib/auth";
import { allMine } from "@/lib/mylist";

const COOKIE = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password || String(username).trim().length < 2 || String(password).length < 4) {
    return NextResponse.json({ error: "Username min 2, password min 4 characters." }, { status: 400 });
  }
  if (await findUserByUsername(username)) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const { salt, hash } = hashPassword(password);
  const id = randomBytes(8).toString("hex");
  await createUser({ id, username: String(username).trim(), salt, hash, createdAt: Date.now() });

  // Seed Alex's starter library (his 242 titles) so his list is there on first login.
  if (String(username).trim().toLowerCase() === "alex") {
    const entries: LibEntry[] = allMine.map((m, i) => ({
      key: entryKey(m),
      media: { ...m, personal: true },
      status: m.myStatus || "Planning",
      rating: m.myRating || 0,
      updatedAt: Date.now() - i,
    }));
    await seedLibrary(id, entries);
  }

  const token = newToken();
  await createSession(token, id);
  const res = NextResponse.json({ user: { id, username: String(username).trim() } });
  res.cookies.set(SESSION_COOKIE, token, COOKIE);
  return res;
}
