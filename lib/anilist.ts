import type { Media, MediaDetail, Character, Review, Relation } from "./types";

const ENDPOINT = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  idMal
  title { english romaji native }
  coverImage { extraLarge large color }
  bannerImage
  averageScore
  popularity
  episodes
  duration
  format
  status
  seasonYear
  genres
  description(asHtml: false)
`;

/* eslint-disable @typescript-eslint/no-explicit-any */

async function gql<T>(query: string, variables: Record<string, unknown> = {}, attempt = 0): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });

  // AniList rate-limits (429) and occasional 5xx — back off and retry
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1000 + 300;
    await new Promise((r) => setTimeout(r, Math.min(waitMs, 60000)));
    return gql<T>(query, variables, attempt + 1);
  }

  if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList error");
  return json.data as T;
}

function stripHtml(s?: string | null): string | null {
  if (!s) return null;
  return s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

export function mapMedia(m: any): Media {
  const english = m.title?.english;
  const romaji = m.title?.romaji;
  return {
    id: m.id,
    idMal: m.idMal ?? null,
    title: english || romaji || m.title?.native || "Untitled",
    titleSecondary: english && romaji && english !== romaji ? romaji : null,
    cover: m.coverImage?.extraLarge || m.coverImage?.large || "",
    banner: m.bannerImage ?? null,
    score: m.averageScore ?? null,
    format: m.format ?? null,
    status: m.status ?? null,
    year: m.seasonYear ?? null,
    episodes: m.episodes ?? null,
    duration: m.duration ?? null,
    genres: m.genres ?? [],
    description: stripHtml(m.description),
    color: m.coverImage?.color ?? null,
    popularity: m.popularity ?? null,
  };
}

export interface ListParams {
  sort?: string[];
  type?: "ANIME" | "MANGA";
  format?: string;
  genre?: string;
  status?: string;
  season?: string;
  seasonYear?: number;
  search?: string;
  perPage?: number;
  page?: number;
}

export async function getMediaList(params: ListParams = {}): Promise<Media[]> {
  const {
    sort = ["TRENDING_DESC"],
    type = "ANIME",
    format,
    genre,
    status,
    season,
    seasonYear,
    search,
    perPage = 20,
    page = 1,
  } = params;

  // IMPORTANT: only include arguments that are actually set. Passing an argument
  // as `null` (e.g. season: null) makes AniList filter on null and return nothing.
  const decls: string[] = ["$page:Int", "$perPage:Int", "$sort:[MediaSort]", "$type:MediaType"];
  const args: string[] = ["sort: $sort", "type: $type", "isAdult: false"];
  const variables: Record<string, unknown> = { page, perPage, sort, type };

  const add = (cond: unknown, decl: string, arg: string, key: string, val: unknown) => {
    if (cond === undefined || cond === null || cond === "") return;
    decls.push(decl);
    args.push(arg);
    variables[key] = val;
  };
  add(format, "$format:MediaFormat", "format: $format", "format", format);
  add(genre, "$genre:String", "genre: $genre", "genre", genre);
  add(status, "$status:MediaStatus", "status: $status", "status", status);
  add(season, "$season:MediaSeason", "season: $season", "season", season);
  add(seasonYear, "$seasonYear:Int", "seasonYear: $seasonYear", "seasonYear", seasonYear);
  add(search, "$search:String", "search: $search", "search", search);

  const query = `
    query (${decls.join(", ")}) {
      Page(page:$page, perPage:$perPage) {
        media(${args.join(", ")}) { ${MEDIA_FIELDS} }
      }
    }`;

  try {
    const data = await gql<{ Page: { media: any[] } }>(query, variables);
    return (data.Page?.media || []).map(mapMedia).filter((m) => m.cover);
  } catch (e) {
    console.error("getMediaList failed:", (e as Error).message);
    return [];
  }
}

export const getTrending = () => getMediaList({ sort: ["TRENDING_DESC"], perPage: 24 });
export const getPopular = () => getMediaList({ sort: ["POPULARITY_DESC"], perPage: 24 });
export const getTopRated = () => getMediaList({ sort: ["SCORE_DESC"], perPage: 24 });
export const getAiring = () => getMediaList({ sort: ["POPULARITY_DESC"], status: "RELEASING", perPage: 24 });
export const getMovies = () => getMediaList({ sort: ["POPULARITY_DESC"], format: "MOVIE", perPage: 24 });
export const getRecent = () => getMediaList({ sort: ["START_DATE_DESC"], status: "FINISHED", perPage: 24 });
export const getByGenre = (genre: string) => getMediaList({ sort: ["POPULARITY_DESC"], genre, perPage: 24 });

export async function searchMedia(q: string, perPage = 18): Promise<Media[]> {
  if (!q.trim()) return [];
  return getMediaList({ search: q, sort: ["SEARCH_MATCH"], perPage });
}

export async function getMediaDetail(opts: { id?: number; idMal?: number }): Promise<MediaDetail | null> {
  const byMal = opts.id == null && opts.idMal != null;
  const decl = byMal ? "$idMal:Int" : "$id:Int";
  const idArg = byMal ? "idMal: $idMal" : "id: $id";
  const variables = byMal ? { idMal: opts.idMal } : { id: opts.id };
  const query = `
    query (${decl}){
      Media(${idArg}, type:ANIME){
        ${MEDIA_FIELDS}
        season
        startDate { year month day }
        trailer { id site thumbnail }
        studios(isMain:true) { nodes { name } }
        characters(sort:[ROLE,RELEVANCE], perPage:14) {
          edges { role node { name { full } image { large } } voiceActors(language:JAPANESE) { name { full } image { large } } }
        }
        recommendations(sort:RATING_DESC, perPage:14) {
          nodes { mediaRecommendation { ${MEDIA_FIELDS} } }
        }
        relations {
          edges { relationType node { id idMal title { english romaji } coverImage { large color } bannerImage format type averageScore seasonYear } }
        }
        tags { name rank isGeneralSpoiler }
        reviews(sort:RATING_DESC, perPage:6) { nodes { summary score user { name avatar { large } } } }
      }
    }`;

  try {
    const data = await gql<{ Media: any }>(query, variables);
    const m = data.Media;
    if (!m) return null;

    const base = mapMedia(m);

    const characters: Character[] = (m.characters?.edges || []).map((e: any) => ({
      name: e.node?.name?.full || "Unknown",
      image: e.node?.image?.large || "",
      role: e.role || null,
      vaName: e.voiceActors?.[0]?.name?.full || null,
      vaImage: e.voiceActors?.[0]?.image?.large || null,
    }));

    const recommendations: Media[] = (m.recommendations?.nodes || [])
      .map((n: any) => n.mediaRecommendation)
      .filter(Boolean)
      .map(mapMedia)
      .filter((x: Media) => x.cover);

    const relations: Relation[] = (m.relations?.edges || [])
      .filter((e: any) => e.node?.type === "ANIME" && e.node?.coverImage?.large)
      .map((e: any) => ({
        relation: (e.relationType || "").replace(/_/g, " ").toLowerCase(),
        media: {
          id: e.node.id,
          idMal: e.node.idMal ?? null,
          title: e.node.title?.english || e.node.title?.romaji || "Untitled",
          cover: e.node.coverImage?.large || "",
          banner: e.node.bannerImage ?? null,
          score: e.node.averageScore ?? null,
          format: e.node.format ?? null,
          year: e.node.seasonYear ?? null,
          color: e.node.coverImage?.color ?? null,
        } as Media,
      }));

    const reviews: Review[] = (m.reviews?.nodes || []).map((r: any) => ({
      summary: r.summary || "",
      score: r.score ?? null,
      user: r.user?.name || "Anonymous",
      avatar: r.user?.avatar?.large ?? null,
    }));

    const tags: string[] = (m.tags || [])
      .filter((t: any) => !t.isGeneralSpoiler && t.rank >= 50)
      .slice(0, 10)
      .map((t: any) => t.name);

    return {
      ...base,
      season: m.season ?? null,
      startDate: m.startDate ?? null,
      trailer: m.trailer?.site === "youtube" && m.trailer?.id ? { id: m.trailer.id, site: m.trailer.site, thumbnail: m.trailer.thumbnail } : null,
      studios: (m.studios?.nodes || []).map((s: any) => s.name),
      characters,
      recommendations,
      relations,
      tags,
      reviews,
    };
  } catch (e) {
    console.error("getMediaDetail failed:", (e as Error).message);
    return null;
  }
}
