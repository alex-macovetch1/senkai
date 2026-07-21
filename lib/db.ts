import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Media } from "./types";
import { entryKey } from "./types";

export { entryKey };

/* ------------------------------------------------------------------
   Cloud store — Supabase (Postgres). Same function surface the app
   already used with the old JSON file, so nothing else changes.
   Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment.
------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface User {
  id: string;
  username: string;
  salt: string;
  hash: string;
  createdAt: number;
}

export interface LibEntry {
  key: string;
  media: Media;
  status: string;
  rating: number;
  updatedAt: number;
}

let _sb: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY lipsesc (adaugă-le în .env.local).");
  }
  _sb = createClient(url, key, { auth: { persistSession: false } });
  return _sb;
}

function rowToUser(r: any): User {
  return { id: r.id, username: r.username, salt: r.salt, hash: r.hash, createdAt: Number(r.created_at) };
}
function rowToEntry(r: any): LibEntry {
  return { key: r.key, media: r.media, status: r.status, rating: r.rating, updatedAt: Number(r.updated_at) };
}

/* users */
export async function findUserByUsername(username: string): Promise<User | null> {
  const { data } = await sb().from("users").select("*").ilike("username", username).limit(1).maybeSingle();
  return data ? rowToUser(data) : null;
}
export async function getUserById(id: string): Promise<User | null> {
  const { data } = await sb().from("users").select("*").eq("id", id).maybeSingle();
  return data ? rowToUser(data) : null;
}
export async function createUser(user: User): Promise<void> {
  await sb().from("users").insert({
    id: user.id, username: user.username, salt: user.salt, hash: user.hash, created_at: user.createdAt,
  });
}

/* sessions */
export async function createSession(token: string, userId: string): Promise<void> {
  await sb().from("sessions").insert({ token, user_id: userId, created_at: Date.now() });
}
export async function getSessionUserId(token: string): Promise<string | null> {
  const { data } = await sb().from("sessions").select("user_id").eq("token", token).maybeSingle();
  return data?.user_id ?? null;
}
export async function deleteSession(token: string): Promise<void> {
  await sb().from("sessions").delete().eq("token", token);
}

/* library */
export async function getLibrary(userId: string): Promise<LibEntry[]> {
  const { data } = await sb()
    .from("library").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  return (data ?? []).map(rowToEntry);
}
export async function upsertEntry(
  userId: string,
  media: Media,
  patch: { status?: string; rating?: number },
): Promise<LibEntry> {
  const key = entryKey(media);
  const { data: existing } = await sb()
    .from("library").select("status,rating").eq("user_id", userId).eq("key", key).maybeSingle();
  const entry: LibEntry = {
    key,
    media: { ...media, personal: true },
    status: patch.status ?? existing?.status ?? "Planning",
    rating: patch.rating ?? existing?.rating ?? 0,
    updatedAt: Date.now(),
  };
  await sb().from("library").upsert({
    user_id: userId, key, media: entry.media, status: entry.status, rating: entry.rating, updated_at: entry.updatedAt,
  });
  return entry;
}
export async function removeEntry(userId: string, key: string): Promise<void> {
  await sb().from("library").delete().eq("user_id", userId).eq("key", key);
}
export async function seedLibrary(userId: string, entries: LibEntry[]): Promise<void> {
  if (!entries.length) return;
  const rows = entries.map((e) => ({
    user_id: userId, key: e.key, media: e.media, status: e.status, rating: e.rating, updated_at: e.updatedAt,
  }));
  await sb().from("library").upsert(rows);
}
