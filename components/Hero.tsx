"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Media } from "@/lib/types";
import { mediaHref } from "@/lib/types";
import { Mark, Play, Info, Star } from "./icons";

export default function Hero({ items }: { items: Media[] }) {
  const slides = items.filter((i) => i.banner && i.description).slice(0, 6);
  const [idx, setIdx] = useState(0);

  const next = useCallback(() => setIdx((i) => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(next, 7500);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!slides.length) return null;
  const m = slides[idx];
  const score = m.score ? (m.score / 10).toFixed(1) : null;

  return (
    <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden">
      {/* background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={m.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: 8, ease: "linear" } }}
          className="absolute inset-0"
        >
          <Image src={m.banner!} alt={m.title} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_50%,rgba(168,85,247,0.18),transparent_70%)]" />

      {/* content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 sm:px-10 sm:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full brand-gradient px-3 py-1 font-bold uppercase tracking-wider text-white">
                <Mark size={12} /> Featured
              </span>
              {m.format && (
                <span className="rounded-full panel px-3 py-1 font-medium">{m.format.replace(/_/g, " ")}</span>
              )}
              {m.year && <span className="rounded-full panel px-3 py-1 font-medium">{m.year}</span>}
              {m.episodes && <span className="rounded-full panel px-3 py-1 font-medium">{m.episodes} episodes</span>}
            </div>

            <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              <span className="text-gradient">{m.title}</span>
            </h1>
            {m.titleSecondary && (
              <p className="mt-2 text-sm text-ink-muted sm:text-base">{m.titleSecondary}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {score && (
                <span className="flex items-center gap-1 font-bold text-accent">
                  <Star size={14} /> {score}
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                {(m.genres || []).slice(0, 4).map((g) => (
                  <span key={g} className="text-ink-muted">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <p className="clamp-3 mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
              {m.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={mediaHref(m)}
                className="group flex items-center gap-2 rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:brightness-110 hover:scale-[1.03] active:scale-95"
              >
                <Play size={16} />
                Watch now
              </Link>
              <Link
                href={mediaHref(m)}
                className="flex items-center gap-2 rounded-full panel px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                <Info size={16} /> More details
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* indicators */}
        <div className="mt-9 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              aria-label={`slide ${i + 1}`}
              className="group relative h-1.5 overflow-hidden rounded-full bg-white/20 transition-all"
              style={{ width: i === idx ? 40 : 16 }}
            >
              {i === idx && (
                <motion.span
                  key={m.id}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 7.5, ease: "linear" }}
                  className="absolute inset-y-0 left-0 brand-gradient"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* floating poster stack (desktop) */}
      <div className="absolute bottom-24 right-10 z-10 hidden gap-3 lg:flex">
        {slides.slice(0, 4).map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`relative h-40 w-28 overflow-hidden rounded-xl ring-1 transition-all duration-500 ${
              i === idx ? "ring-brand shadow-glow scale-105" : "ring-white/10 opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={s.cover} alt={s.title} fill sizes="112px" className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
