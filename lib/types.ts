export interface Media {
  id: number;
  idMal?: number | null;
  title: string;
  titleSecondary?: string | null;
  cover: string;
  banner?: string | null;
  score?: number | null; // 0-100
  format?: string | null;
  status?: string | null;
  year?: number | null;
  episodes?: number | null;
  duration?: number | null;
  genres?: string[];
  description?: string | null;
  color?: string | null;
  popularity?: number | null;
  // personalization (from user's list)
  personal?: boolean;
  progress?: { watched: number; total: number } | null;
  myRating?: number | null;
  myStatus?: string | null;
}

export interface Character {
  name: string;
  image: string;
  role?: string | null;
  vaName?: string | null;
  vaImage?: string | null;
}

export interface Review {
  summary: string;
  score?: number | null;
  user: string;
  avatar?: string | null;
}

export interface Relation {
  relation: string;
  media: Media;
}

export interface MediaDetail extends Media {
  trailer?: { id: string; site: string; thumbnail?: string | null } | null;
  studios?: string[];
  characters?: Character[];
  recommendations?: Media[];
  relations?: Relation[];
  tags?: string[];
  reviews?: Review[];
  startDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  season?: string | null;
}

/** Route href for any media (personal list items resolve by MAL id). */
export function mediaHref(m: Media): string {
  if (m.personal && m.idMal) return `/title/m${m.idMal}`;
  return `/title/${m.id}`;
}

/** Stable library key for a title (client-safe — no server imports). */
export function entryKey(m: Pick<Media, "id" | "idMal">): string {
  return m.idMal ? `m${m.idMal}` : `a${m.id}`;
}
