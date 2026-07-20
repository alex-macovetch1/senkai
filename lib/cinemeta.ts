import type { Media, MediaDetail } from "./types";

/* ------------------------------------------------------------------
   Cinemeta client — movies & series, no API key required.
   Cinemeta is the public metadata addon behind Stremio. It redirects
   (307) to cinemeta-catalogs.strem.io; fetch follows that automatically.
   Posters/backgrounds come from images.metahub.space by IMDB id.
   Data is mapped into the shared `Media` shape so MediaRow/MediaCard
   render it unchanged.
------------------------------------------------------------------ */

const BASE = "https://v3-cinemeta.strem.io";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type CineType = "movie" | "series";

async function cine<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(BASE + path, { next: { revalidate } });
  if (!res.ok) throw new Error(`Cinemeta ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** Cinemeta ids are IMDB ids ("tt37287335"); Media.id is numeric, so we keep
 *  the full id in `slug` and store the numeric part in `id`. */
function numericId(imdb: string): number {
  const n = Number(String(imdb).replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function mapCine(m: any, type: CineType): Media {
  const rating = m.imdbRating ? Math.round(parseFloat(m.imdbRating) * 10) : null;
  const year = m.year ? String(m.year).slice(0, 4) : m.releaseInfo ? String(m.releaseInfo).slice(0, 4) : null;
  return {
    id: numericId(m.id || m.imdb_id),
    category: type === "movie" ? "movie" : "series",
    slug: m.id || m.imdb_id,
    title: m.name ?? "Untitled",
    titleSecondary: null,
    cover: m.poster || "",
    banner: m.background || m.poster || null,
    score: rating,
    format: type === "movie" ? "MOVIE" : "SERIES",
    status: null,
    year: year ? Number(year) : null,
    genres: m.genres ?? m.genre ?? [],
    description: m.description ?? null,
    color: null,
    popularity: m.popularity ?? null,
  };
}

async function catalog(type: CineType, extra = ""): Promise<Media[]> {
  const data = await cine<{ metas: any[] }>(`/catalog/${type}/top${extra}.json`);
  return (data.metas ?? []).map((m) => mapCine(m, type));
}

export const getTopMovies = () => catalog("movie");
export const getTopSeries = () => catalog("series");
export const getMoviesByGenre = (genre: string) => catalog("movie", `/genre=${encodeURIComponent(genre)}`);
export const getSeriesByGenre = (genre: string) => catalog("series", `/genre=${encodeURIComponent(genre)}`);

export async function searchCine(type: CineType, q: string): Promise<Media[]> {
  if (!q.trim()) return [];
  const data = await cine<{ metas: any[] }>(`/catalog/${type}/top/search=${encodeURIComponent(q)}.json`);
  return (data.metas ?? []).map((m) => mapCine(m, type));
}

export async function getCineDetail(type: CineType, id: string): Promise<MediaDetail | null> {
  try {
    const data = await cine<{ meta: any }>(`/meta/${type}/${id}.json`);
    const m = data.meta;
    if (!m) return null;
    const base = mapCine(m, type);
    const cast: string[] = m.cast ?? [];
    return {
      ...base,
      description: m.description ?? null,
      studios: m.director ?? (m.writer ? [m.writer].flat() : []),
      tags: (m.genres ?? []).slice(0, 12),
      duration: m.runtime ? parseInt(String(m.runtime), 10) || null : null,
      startDate: base.year ? { year: base.year } : null,
      characters: cast.slice(0, 12).map((name) => ({ name, image: "", role: "Cast" })),
      recommendations: [],
      relations: [],
      reviews: [],
    } as MediaDetail;
  } catch {
    return null;
  }
}
