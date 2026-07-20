"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard";
import { mapMedia } from "@/lib/anilist";
import type { Media } from "@/lib/types";
import { Search as SearchIcon } from "./icons";

const FIELDS = `id idMal title { english romaji native } coverImage { extraLarge large color } bannerImage averageScore popularity episodes duration format status seasonYear genres description(asHtml:false)`;

// Only include args that are set — a null arg makes AniList return nothing.
function buildQuery(filters: { genre?: string; format?: string; search?: string; status?: string }) {
  const decls = ["$page:Int", "$perPage:Int", "$sort:[MediaSort]"];
  const args = ["type:ANIME", "isAdult:false", "sort:$sort"];
  if (filters.genre) { decls.push("$genre:String"); args.push("genre:$genre"); }
  if (filters.format) { decls.push("$format:MediaFormat"); args.push("format:$format"); }
  if (filters.search) { decls.push("$search:String"); args.push("search:$search"); }
  if (filters.status) { decls.push("$status:MediaStatus"); args.push("status:$status"); }
  return `query (${decls.join(", ")}) { Page(page:$page, perPage:$perPage) { pageInfo { hasNextPage } media(${args.join(", ")}) { ${FIELDS} } } }`;
}

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"];
const FORMATS = ["", "TV", "MOVIE", "OVA", "ONA", "SPECIAL"];
const SORTS: [string, string][] = [
  ["TRENDING_DESC", "Trending"],
  ["POPULARITY_DESC", "Popular"],
  ["SCORE_DESC", "Top Rated"],
  ["START_DATE_DESC", "Newest"],
  ["TITLE_ROMAJI", "A–Z"],
];

export default function BrowseClient({
  initial,
  searchMode = false,
}: {
  initial: { genre?: string; format?: string; sort?: string; status?: string; q?: string };
  searchMode?: boolean;
}) {
  const [search, setSearch] = useState(initial.q || "");
  const [genre, setGenre] = useState(initial.genre || "");
  const [format, setFormat] = useState(initial.format || "");
  const [sort, setSort] = useState(initial.sort || (searchMode ? "SEARCH_MATCH" : "TRENDING_DESC"));
  const [status] = useState(initial.status || "");

  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      const myReq = ++reqId.current;
      setLoading(true);
      try {
        const term = search.trim();
        const filters = { genre, format, search: term, status };
        const variables: Record<string, unknown> = {
          page: pageNum,
          perPage: 24,
          sort: [term ? "SEARCH_MATCH" : sort],
        };
        if (genre) variables.genre = genre;
        if (format) variables.format = format;
        if (term) variables.search = term;
        if (status) variables.status = status;
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: buildQuery(filters), variables }),
        });
        const json = await res.json();
        if (myReq !== reqId.current) return;
        const media = (json?.data?.Page?.media || []).map(mapMedia).filter((m: Media) => m.cover);
        setHasNext(Boolean(json?.data?.Page?.pageInfo?.hasNextPage));
        setItems((prev) => (replace ? media : [...prev, ...media]));
      } catch {
        if (myReq === reqId.current) setHasNext(false);
      } finally {
        if (myReq === reqId.current) setLoading(false);
      }
    },
    [genre, format, sort, search, status],
  );

  // refetch on filter change (debounced for search)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchPage(1, true);
    }, search.trim() ? 320 : 0);
    return () => clearTimeout(t);
  }, [genre, format, sort, search, fetchPage]);

  const loadMore = () => {
    const p = page + 1;
    setPage(p);
    fetchPage(p, false);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-3xl font-black sm:text-4xl"
      >
        {searchMode ? "Search" : "Browse the Universe"}
      </motion.h1>

      {/* filter bar */}
      <div className="sticky top-16 z-30 -mx-2 mb-8 rounded-2xl panel-strong p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5">
            <SearchIcon size={18} className="text-brand" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
            />
          </div>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            <Select value={genre} onChange={setGenre} options={[["", "All genres"] as [string, string], ...GENRES.map((g) => [g, g] as [string, string])]} />
            <Select value={format} onChange={setFormat} options={FORMATS.map((f) => [f, f || "All formats"] as [string, string])} />
            <Select value={sort} onChange={setSort} options={SORTS} />
          </div>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {items.map((m, i) => (
          <MediaCard key={`${m.id}-${i}`} media={m} index={i} className="w-full" animate={false} cv />
        ))}
        {loading && items.length === 0 &&
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl shimmer" />
          ))}
      </div>

      {!loading && items.length === 0 && (
        <p className="mt-16 text-center text-ink-faint">No titles match these filters.</p>
      )}

      {hasNext && items.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full panel px-8 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="shrink-0 rounded-xl bg-white/5 px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 transition hover:bg-white/10 focus:ring-brand/50"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v} className="bg-bg-elev text-white">
          {label}
        </option>
      ))}
    </select>
  );
}
