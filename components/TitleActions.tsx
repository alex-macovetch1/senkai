"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicPlayer from "./CinematicPlayer";
import Portal from "./Portal";
import { useAuth } from "./AuthProvider";
import { Play, Plus, Check, Close } from "./icons";
import type { Media } from "@/lib/types";
import { entryKey } from "@/lib/types";

const LIST_KEY = "senkai:list";
const RATE_KEY = "senkai:ratings";
const STATUS_KEY = "senkai:status";

const STATUSES = ["Watching", "Planning", "Completed", "On Hold", "Dropped"] as const;
const STATUS_LABEL: Record<string, string> = { Planning: "Planned to Watch" };
const label = (s: string) => STATUS_LABEL[s] || s;

function readMap(key: string): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function readRatings(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(RATE_KEY) || "{}"); } catch { return {}; }
}
function readList(): Media[] {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || "[]"); } catch { return []; }
}

export default function TitleActions({ media, trailerId }: { media: Media; trailerId?: string | null }) {
  const { user, library, setEntry, removeEntry } = useAuth();
  const key = entryKey(media);
  const serverEntry = user ? library[key] : undefined;

  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localRating, setLocalRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const status = user ? serverEntry?.status || null : localStatus;
  const rating = user ? serverEntry?.rating || 0 : localRating;
  const saved = !!status;

  useEffect(() => {
    if (user) return;
    setLocalStatus(readMap(STATUS_KEY)[String(media.id)] || null);
    setLocalRating(readRatings()[String(media.id)] || 0);
  }, [media.id, user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const slim: Media = {
    id: media.id, idMal: media.idMal, title: media.title, cover: media.cover,
    score: media.score, format: media.format, year: media.year, episodes: media.episodes, personal: true,
  };

  const choose = async (s: string) => {
    setMenuOpen(false);
    if (user) {
      await setEntry(slim, { status: s });
    } else {
      const map = readMap(STATUS_KEY); map[String(media.id)] = s;
      localStorage.setItem(STATUS_KEY, JSON.stringify(map));
      const list = readList();
      if (!list.some((m) => m.id === media.id)) localStorage.setItem(LIST_KEY, JSON.stringify([slim, ...list]));
      setLocalStatus(s);
    }
    setToast(`Added to ${label(s)}`);
  };

  const remove = async () => {
    setMenuOpen(false);
    if (user) {
      await removeEntry(slim);
    } else {
      const map = readMap(STATUS_KEY); delete map[String(media.id)];
      localStorage.setItem(STATUS_KEY, JSON.stringify(map));
      localStorage.setItem(LIST_KEY, JSON.stringify(readList().filter((m) => m.id !== media.id)));
      setLocalStatus(null);
    }
    setToast("Removed from your list");
  };

  const rate = async (n: number) => {
    if (user) {
      await setEntry(slim, { rating: n, status: serverEntry?.status || "Completed" });
    } else {
      const ratings = readRatings(); ratings[String(media.id)] = n;
      localStorage.setItem(RATE_KEY, JSON.stringify(ratings));
      setLocalRating(n);
      if (!localStatus) { const map = readMap(STATUS_KEY); map[String(media.id)] = "Completed"; localStorage.setItem(STATUS_KEY, JSON.stringify(map)); setLocalStatus("Completed"); }
    }
    setToast(`Rated ${n}/10`);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPlayerOpen(true)}
            className="group flex items-center gap-2 rounded-full brand-gradient px-7 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03] active:scale-95"
          >
            <Play size={16} /> {trailerId ? "Watch trailer" : "Open player"}
          </button>

          {/* add-to-list picker */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                saved ? "bg-brand/20 text-brand ring-1 ring-brand/50" : "panel hover:bg-white/10"
              }`}
            >
              {saved ? <Check size={16} /> : <Plus size={16} />}
              {saved ? label(status!) : "Add to list"}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="m6 9 6 6 6-6" /></svg>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl glass-strong p-1.5 shadow-glow"
                  >
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => choose(s)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-white/10 ${status === s ? "text-brand" : "text-white/90"}`}
                      >
                        {label(s)}
                        {status === s && <Check size={15} />}
                      </button>
                    ))}
                    {saved && (
                      <button onClick={remove} className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-white/10 px-3 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10">
                        <Close size={14} /> Remove from list
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-faint">Your rating:</span>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onClick={() => rate(n)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${n <= (hover || rating) ? "brand-gradient scale-110" : "bg-white/15 hover:bg-white/30"}`}
                aria-label={`rate ${n}`}
              />
            ))}
          </div>
          {rating > 0 && <span className="text-xs font-bold text-brand">{rating}/10</span>}
        </div>
      </div>

      <CinematicPlayer open={playerOpen} onClose={() => setPlayerOpen(false)} youtubeId={trailerId} title={media.title} episodes={media.episodes} />

      <Portal>
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 40, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="fixed bottom-8 left-1/2 z-[130] rounded-full glass-strong px-5 py-3 text-sm font-medium shadow-glow"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
