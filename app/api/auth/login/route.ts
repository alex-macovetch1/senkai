import { NextResponse } from "next/server";
import { findUserByUsername, createSession } from "@/lib/db";
import { verifyPassword, newToken, SESSION_COOKIE } from "@/lib/auth";

const COOKIE = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  const user = username ? await findUserByUsername(String(username)) : null;
  if (!user || !verifyPassword(String(password || ""), user.salt, user.hash)) {
    return NextResponse.json({ error: "Wrong username or password." }, { status: 401 });
  }
  const token = newToken();
  await createSession(token, user.id);
  const res = NextResponse.json({ user: { id: user.id, username: user.username } });
  res.cookies.set(SESSION_COOKIE, token, COOKIE);
  return res;
}
