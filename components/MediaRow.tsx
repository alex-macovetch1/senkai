"use client";

import { useRef } from "react";
import Link from "next/link";
import MediaCard from "./MediaCard";
import type { Media } from "@/lib/types";
import { ChevronLeft, ChevronRight, ArrowRight } from "./icons";

export default function MediaRow({
  title,
  items,
  href,
  subtitle,
}: {
  title: string;
  items: Media[];
  href?: string;
  subtitle?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!items?.length) return null;

  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="relative py-4">
      <div className="mb-3 flex items-end justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1.5 rounded-full brand-gradient" />
          <div>
            <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
            {subtitle && <p className="text-xs text-ink-faint">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-ink-muted transition hover:bg-white/5 hover:text-white"
            >
              view all <ArrowRight size={14} />
            </Link>
          )}
          <button
            aria-label="scroll left"
            onClick={() => scroll(-1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full panel transition hover:bg-white/10 hover:text-brand sm:flex"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="scroll right"
            onClick={() => scroll(1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full panel transition hover:bg-white/10 hover:text-brand sm:flex"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-8"
      >
        {items.map((m, i) => (
          <MediaCard key={`${m.id}-${i}`} media={m} index={i} />
        ))}
      </div>
    </section>
  );
}
