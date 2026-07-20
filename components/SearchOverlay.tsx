"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MediaCard from "./MediaCard";
import Portal from "./Portal";
import type { Media } from "@/lib/types";
import { mapMedia } from "@/lib/anilist";
import { Search as SearchIcon } from "./icons";

const SEARCH_QUERY = `
  query ($search: String) {
    Page(perPage: 18) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH, isAdult: false) {
        id idMal
        title { english romaji native }
        coverImage { extraLarge large color }
        bannerImage averageScore popularity episodes duration format status seasonYear genres
        description(asHtml: false)
      }
    }
  }`;

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Thriller"];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQ("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: q } }),
          signal: ctrl.signal,
        });
        const json = await res.json();
        const media = (json?.data?.Page?.media || []).map(mapMedia).filter((m: Media) => m.cover);
        setResults(media);
      } catch {
        /* aborted or network */
      } finally {
        setLoading(false);
      }
    }, 320);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] glass-strong"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex h-full max-w-5xl flex-col px-6 pt-8 sm:pt-14"
          >
            <div className="flex items-center gap-3 rounded-2xl panel-strong px-5 py-4">
              <SearchIcon size={20} className="text-brand" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search anime, movies, series…"
                className="w-full bg-transparent text-lg outline-none placeholder:text-ink-faint"
              />
              {loading && (
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
              )}
              <button
                onClick={onClose}
                className="rounded-full px-3 py-1 text-xs text-ink-muted transition hover:bg-white/10 hover:text-white"
              >
                ESC
              </button>
            </div>

            <div className="hide-scrollbar mt-6 flex-1 overflow-y-auto pb-16">
              {!q.trim() ? (
                <div className="mt-6">
                  <p className="mb-3 text-sm text-ink-faint">Popular genres</p>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((g) => (
                      <a
                        key={g}
                        href={`/browse?genre=${g}`}
                        className="rounded-full panel px-4 py-2 text-sm transition hover:bg-brand/20 hover:text-white"
                      >
                        {g}
                      </a>
                    ))}
                  </div>
                </div>
              ) : results.length ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6">
                  {results.map((m, i) => (
                    <MediaCard key={m.id} media={m} index={i} className="w-full" />
                  ))}
                </div>
              ) : !loading ? (
                <p className="mt-16 text-center text-ink-faint">No results for “{q}”.</p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
