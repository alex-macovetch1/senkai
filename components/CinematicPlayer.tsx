"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal";
import { Close, Prev, Pause, Next, Skip, Subtitles, Settings, Sound } from "./icons";

export default function CinematicPlayer({
  open,
  onClose,
  youtubeId,
  title,
  episodes = 0,
}: {
  open: boolean;
  onClose: () => void;
  youtubeId?: string | null;
  title: string;
  episodes?: number | null;
}) {
  const [ep, setEp] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const epCount = Math.min(episodes || 1, 24);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex flex-col bg-black"
          onMouseMove={() => setShowControls(true)}
        >
          {/* video */}
          <div className="relative flex-1 bg-black">
            {youtubeId ? (
              <iframe
                key={ep}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-center">
                <div>
                  <p className="text-2xl font-bold">No trailer available</p>
                  <p className="mt-2 text-sm text-ink-muted">Full streaming is coming to Senkai soon.</p>
                </div>
              </div>
            )}

            {/* top bar */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent p-5"
                >
                  <div className="pointer-events-auto">
                    <p className="text-xs uppercase tracking-widest text-brand">Now playing · Trailer</p>
                    <h3 className="text-lg font-bold">{title}{epCount > 1 ? ` — Episode ${ep}` : ""}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full panel-strong transition hover:bg-white/15"
                  >
                    <Close size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* control bar */}
          <div className="glass-strong border-t border-white/10 px-5 py-3">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <PlayerBtn><Prev size={18} /></PlayerBtn>
                <PlayerBtn><Pause size={18} /></PlayerBtn>
                <PlayerBtn><Next size={18} /></PlayerBtn>
                <button className="ml-2 flex items-center gap-1.5 rounded-full bg-brand/20 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/30">
                  <Skip size={14} /> Skip intro
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5 rounded-lg panel px-2.5 py-1.5"><Subtitles size={14} /> Subtitles</span>
                <span className="flex items-center gap-1.5 rounded-lg panel px-2.5 py-1.5"><Settings size={14} /> 1080p</span>
                <span className="flex items-center gap-1.5 rounded-lg panel px-2.5 py-1.5"><Sound size={14} /> Auto</span>
              </div>
            </div>

            {epCount > 1 && (
              <div className="hide-scrollbar mx-auto mt-3 flex max-w-6xl gap-2 overflow-x-auto">
                {Array.from({ length: epCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setEp(n)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      n === ep ? "brand-gradient text-white" : "glass text-ink-muted hover:text-white"
                    }`}
                  >
                    EP {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}

function PlayerBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-9 w-9 place-items-center rounded-full panel transition hover:bg-white/15">{children}</button>
  );
}
