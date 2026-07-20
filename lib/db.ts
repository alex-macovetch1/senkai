import { promises as fs } from "fs";
import path from "path";
import type { Media } from "./types";
import { entryKey } from "./types";

export { entryKey };

/* ------------------------------------------------------------------
   Tiny JSON file store — local-first, no external service.
   Swap this module for Supabase/Postgres when publishing online.
------------------------------------------------------------------ */

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
  status: string; // Watching | Completed | Planning | Dropped | Favorite
  rating: number; // 0-10
  updatedAt: number;
}

interface DBShape {
  users: Record<string, User>;
  sessions: Record<string, { userId: string; createdAt: number }>;
  libraries: Record<string, Record<string, LibEntry>>;
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "senkai-db.json");

let cache: DBShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<DBShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    cache = JSON.parse(raw) as DBShape;
  } catch {
    cache = { users: {}, sessions: {}, libraries: {} };
  }
  return cache;
}

async function persist(): Promise<void> {
  // serialize writes so concurrent requests don't clobber the file
  writeChain = writeChain.then(async () => {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(cache), "utf8");
  });
  return writeChain;
}

/* users */
export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await load();
  const u = Object.values(db.users).find((x) => x.username.toLowerCase() === username.toLowerCase());
  return u ?? null;
}
export async function getUserById(id: string): Promise<User | null> {
  const db = await load();
  return db.users[id] ?? null;
}
export async function createUser(user: User): Promise<void> {
  const db = await load();
  db.users[user.id] = user;
  db.libraries[user.id] = {};
  await persist();
}

/* sessions */
export async function createSession(token: string, userId: string): Promise<void> {
  const db = await load();
  db.sessions[token] = { userId, createdAt: Date.now() };
  await persist();
}
export async function getSessionUserId(token: string): Promise<string | null> {
  const db = await load();
  return db.sessions[token]?.userId ?? null;
}
export async function deleteSession(token: string): Promise<void> {
  const db = await load();
  delete db.sessions[token];
  await persist();
}

/* library */
export async function getLibrary(userId: string): Promise<LibEntry[]> {
  const db = await load();
  const lib = db.libraries[userId] || {};
  return Object.values(lib).sort((a, b) => b.updatedAt - a.updatedAt);
}
export async function upsertEntry(
  userId: string,
  media: Media,
  patch: { status?: string; rating?: number },
): Promise<LibEntry> {
  const db = await load();
  db.libraries[userId] = db.libraries[userId] || {};
  const key = entryKey(media);
  const existing = db.libraries[userId][key];
  const entry: LibEntry = {
    key,
    media: { ...media, personal: true },
    status: patch.status ?? existing?.status ?? "Planning",
    rating: patch.rating ?? existing?.rating ?? 0,
    updatedAt: Date.now(),
  };
  db.libraries[userId][key] = entry;
  await persist();
  return entry;
}
export async function removeEntry(userId: string, key: string): Promise<void> {
  const db = await load();
  if (db.libraries[userId]) {
    delete db.libraries[userId][key];
    await persist();
  }
}
export async function seedLibrary(userId: string, entries: LibEntry[]): Promise<void> {
  const db = await load();
  const lib = db.libraries[userId] || {};
  for (const e of entries) lib[e.key] = e;
  db.libraries[userId] = lib;
  await persist();
}
