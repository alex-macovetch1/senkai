import type { Media, MediaDetail } from "./types";

/* ------------------------------------------------------------------
   RAWG games client — server-side only. The key lives in RAWG_API_KEY
   and is never shipped to the browser. Games are mapped into the same
   `Media` shape the rest of Senkai uses, so MediaRow/MediaCard render
   them with zero changes.
------------------------------------------------------------------ */

const BASE = "https://api.rawg.io/api";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Params = Record<string, string | number | undefined>;

async function rawg<T>(path: string, params: Params = {}, revalidate = 3600): Promise<T> {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY lipsește. Adaugă-l în .env.local (vezi rawg.io/apidocs).");

  const url = new URL(BASE + path);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`RAWG ${path} a răspuns ${res.status}`);
  return res.json() as Promise<T>;
}

/** RAWG rating is 0-5; Senkai scores are 0-100. Prefer Metacritic when present. */
function toScore(g: any): number | null {
  if (typeof g.metacritic === "number" && g.metacritic > 0) return g.metacritic;
  if (typeof g.rating === "number" && g.rating > 0) return Math.round(g.rating * 20);
  return null;
}

function yearOf(released?: string | null): number | null {
  if (!released) return null;
  const y = Number(released.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

export function mapGame(g: any): Media {
  return {
    id: g.id,
    category: "game",
    slug: g.slug ?? String(g.id),
    title: g.name ?? "Untitled",
    titleSecondary: null,
    cover: g.background_image || "",
    banner: g.background_image || null,
    score: toScore(g),
    format: "GAME",
    status: null,
    year: yearOf(g.released),
    genres: (g.genres ?? []).map((x: any) => x.name).filter(Boolean),
    description: null, // filled on the detail page
    color: null,
    popularity: g.added ?? null,
  };
}

export interface GameQuery {
  page?: number;
  page_size?: number;
  ordering?: string; // "-rating" | "-released" | "-added" | "-metacritic"
  search?: string;
  genres?: string; // slug
  dates?: string; // "2024-01-01,2024-12-31"
}

export async function getGames(query: GameQuery = {}): Promise<Media[]> {
  const data = await rawg<{ results: any[] }>("/games", { page_size: 24, ...query });
  return (data.results ?? []).map(mapGame);
}

// convenience rows for the /games page
export const getPopularGames = () => getGames({ ordering: "-added" });
export const getTopGames = () => getGames({ ordering: "-metacritic" });
export const getNewGames = () => getGames({ ordering: "-released" });
export const getGamesByGenre = (genre: string) => getGames({ genres: genre, ordering: "-rating" });

export async function searchGames(q: string, page_size = 18): Promise<Media[]> {
  if (!q.trim()) return [];
  return getGames({ search: q, page_size, ordering: "-rating" });
}

export async function getGameDetail(slug: string): Promise<MediaDetail | null> {
  try {
    const g = await rawg<any>(`/games/${slug}`);
    const base = mapGame(g);
    let shots: string[] = [];
    try {
      const s = await rawg<{ results: any[] }>(`/games/${slug}/screenshots`);
      shots = (s.results ?? []).map((x) => x.image).filter(Boolean).slice(0, 8);
    } catch {
      /* screenshots are optional */
    }
    return {
      ...base,
      description: stripHtml(g.description_raw || g.description),
      studios: (g.developers ?? []).map((d: any) => d.name).filter(Boolean),
      tags: (g.tags ?? []).slice(0, 12).map((t: any) => t.name).filter(Boolean),
      startDate: base.year ? { year: base.year } : null,
      recommendations: [],
      relations: [],
      characters: [],
      reviews: [],
      // screenshots ride along on a game-only field
      screenshots: shots,
    } as MediaDetail & { screenshots: string[] };
  } catch {
    return null;
  }
}

function stripHtml(s?: string | null): string | null {
  if (!s) return null;
  return s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}
