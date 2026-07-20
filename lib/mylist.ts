import raw from "@/data/lista-mea.json";
import type { Media } from "./types";

interface RawItem {
  title: string;
  cat: string;
  year: string;
  ids: { mal: number | null; tmdb: number | null; imdb: string | null };
  status: string; // "vazut" | "plan" | "aband" | "curs"
  myRating: number;
  epWatched: number;
  episodes: number;
  score: number;
  poster: string;
  banner: string;
}

const data = raw as unknown as { count: number; items: RawItem[] };

const STATUS_LABEL: Record<string, string> = {
  vazut: "Completed",
  plan: "Planning",
  aband: "Dropped",
  curs: "Watching",
};

function mapMine(i: RawItem): Media {
  return {
    id: i.ids?.mal ?? 0,
    idMal: i.ids?.mal ?? null,
    title: i.title,
    cover: i.poster,
    banner: i.banner || null,
    score: i.score ? Math.round(i.score * 10) : null,
    year: i.year ? Number(i.year) : null,
    episodes: i.episodes || null,
    format: "TV",
    personal: true,
    myRating: i.myRating || null,
    myStatus: STATUS_LABEL[i.status] || i.status,
    progress: i.episodes ? { watched: i.epWatched || 0, total: i.episodes } : null,
  };
}

export const allMine: Media[] = data.items.filter((i) => i.poster).map(mapMine);

export const continueWatching: Media[] = data.items
  .filter(
    (i) =>
      i.poster &&
      (i.status === "curs" ||
        (i.epWatched > 0 && i.episodes > 0 && i.epWatched < i.episodes && i.status !== "plan" && i.status !== "aband")),
  )
  .map(mapMine);

export const planned: Media[] = data.items.filter((i) => i.poster && i.status === "plan").map(mapMine);

export const completed: Media[] = data.items.filter((i) => i.poster && i.status === "vazut").map(mapMine);

export const dropped: Media[] = data.items.filter((i) => i.poster && i.status === "aband").map(mapMine);

export const topRatedByMe: Media[] = data.items
  .filter((i) => i.poster && i.myRating > 0)
  .sort((a, b) => b.myRating - a.myRating || b.score - a.score)
  .map(mapMine)
  .slice(0, 24);

export const myStats = {
  total: data.items.length,
  completed: completed.length,
  planning: planned.length,
  watching: data.items.filter((i) => i.status === "curs").length + continueWatching.length,
  dropped: dropped.length,
  episodesWatched: data.items.reduce((s, i) => s + (i.epWatched || 0), 0),
  meanScore: (() => {
    const rated = data.items.filter((i) => i.myRating > 0);
    return rated.length ? (rated.reduce((s, i) => s + i.myRating, 0) / rated.length).toFixed(1) : "0.0";
  })(),
  daysWatched: Math.round((data.items.reduce((s, i) => s + (i.epWatched || 0) * 23, 0) / 60 / 24) * 10) / 10,
};
