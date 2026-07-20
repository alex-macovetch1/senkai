import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getSessionUserId, getUserById, type User } from "./db";

export const SESSION_COOKIE = "senkai_session";

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const h = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return h.length === stored.length && timingSafeEqual(h, stored);
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export interface PublicUser {
  id: string;
  username: string;
}

export function toPublic(u: User): PublicUser {
  return { id: u.id, username: u.username };
}

/** Read the signed-in user from the session cookie (server-side). */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = await getSessionUserId(token);
  if (!userId) return null;
  const u = await getUserById(userId);
  return u ? toPublic(u) : null;
}
