"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import type { Media } from "@/lib/types";
import { mediaHref } from "@/lib/types";
import { Star } from "./icons";

function fmtLabel(f?: string | null) {
  if (!f) return null;
  return f.replace("TV_SHORT", "TV").replace(/_/g, " ");
}

export default function MediaCard({
  media,
  index = 0,
  className = "w-[150px] sm:w-[176px]",
  animate = true,
  cv = false,
}: {
  media: Media;
  index?: number;
  className?: string;
  animate?: boolean;
  cv?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const score = media.score ? (media.score / 10).toFixed(1) : null;
  const pct = media.progress?.total
    ? Math.min(100, (media.progress.watched / media.progress.total) * 100)
    : 0;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
    el.style.setProperty("--ly", `${(50 + py * 30).toFixed(1)}%`);
    el.style.setProperty("--lx", `${(50 + px * 30).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const inner = (
    <Link
      ref={ref}
      href={mediaHref(media)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="tilt group relative block rounded-2xl"
      style={{ transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
    >
      <div
        className={`relative aspect-[2/3] overflow-hidden rounded-2xl panel-2 ring-1 ring-white/5 transition-shadow duration-500 group-hover:ring-brand/50 group-hover:shadow-[0_22px_55px_-22px_rgba(168,85,247,0.6)] ${
          cv ? "cv-auto" : ""
        }`}
      >
        {media.cover ? (
          <Image src={media.cover} alt={media.title} fill sizes="200px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 shimmer" />
        )}

        {/* sheen that follows the cursor */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(200px circle at var(--lx,50%) var(--ly,50%), rgba(255,255,255,0.14), transparent 60%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-75 transition-opacity duration-300 group-hover:opacity-95" />

        {score && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full panel-strong px-2 py-0.5 text-[11px] font-semibold">
            <Star size={11} className="text-accent" />
            {score}
          </div>
        )}

        {media.myRating ? (
          <div className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white shadow-lg">
            {media.myRating}
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-3">
          {media.myStatus && (
            <span className="mb-1 inline-block rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
              {media.myStatus}
            </span>
          )}
          <p className="clamp-2 text-[13px] font-semibold leading-tight text-white drop-shadow-md">{media.title}</p>
          <div className="mt-1 flex max-h-0 items-center gap-2 overflow-hidden text-[11px] text-ink-muted opacity-0 transition-all duration-300 group-hover:max-h-6 group-hover:opacity-100">
            {fmtLabel(media.format) && <span>{fmtLabel(media.format)}</span>}
            {media.year && <span>· {media.year}</span>}
            {media.episodes && <span>· {media.episodes} ep</span>}
          </div>
          {pct > 0 && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full brand-gradient" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  if (!animate) {
    return <div className={`tilt-scene shrink-0 ${className}`}>{inner}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.03, ease: "easeOut" }}
      className={`tilt-scene shrink-0 ${className}`}
    >
      {inner}
    </motion.div>
  );
}
