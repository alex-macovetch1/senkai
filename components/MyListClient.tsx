"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Media } from "@/lib/types";
import { mediaHref } from "@/lib/types";
import { Trophy, Film, Flame, Clock, Hourglass, Star, ChartBar } from "@/components/icons";

interface Stats {
  total: number;
  completed: number;
  planning: number;
  watching: number;
  dropped: number;
  episodesWatched: number;
  meanScore: string;
  daysWatched: number;
}

const STATUSES = [
  { key: "Watching", label: "Watching" },
  { key: "Rewatching", label: "Rewatching" },
  { key: "Planning", label: "Planned to Watch" },
  { key: "Completed", label: "Completed" },
  { key: "On Hold", label: "On Hold" },
  { key: "Dropped", label: "Dropped" },
];

const PAGE = 48;

/* ---------- inline icons (light, no deps) ---------- */
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;
const IconGrid = ({ on }: { on?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
const IconList = ({ on }: { on?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? "2.6" : "2"} strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>;
const IconChevron = ({ open }: { open: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="m6 9 6 6 6-6" /></svg>;

function scoreOf(m: Media) {
  return m.myRating || (m.score ? Math.round(m.score / 10) : null);
}

/* ---------- light poster card (no tilt / no will-change) ---------- */
function PosterCard({ m }: { m: Media }) {
  const s = scoreOf(m);
  return (
    <Link href={mediaHref(m)} className="cv-auto group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl panel-2 ring-1 ring-white/5 transition duration-300 group-hover:ring-brand/50">
        {m.cover ? (
          <img src={m.cover} alt={m.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="shimmer absolute inset-0" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {s ? <div className="absolute right-1.5 top-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white shadow">{s}</div> : null}
      </div>
      <p className="clamp-2 mt-1.5 text-[12px] font-medium leading-tight text-white/90 group-hover:text-white">{m.title}</p>
      <p className="text-[11px] text-ink-faint">{m.format || "TV"}{m.year ? ` · ${m.year}` : ""}</p>
    </Link>
  );
}

/* ---------- list rows ---------- */
function ListView({ items }: { items: Media[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ink-faint">
            <th className="w-10 py-2 pl-3 font-semibold">#</th>
            <th className="py-2 font-semibold">Name</th>
            <th className="w-20 py-2 text-center font-semibold">Score</th>
            <th className="w-24 py-2 text-center font-semibold">Episodes</th>
            <th className="w-24 py-2 pr-3 text-right font-semibold">Kind</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m, i) => {
            const s = scoreOf(m);
            const w = m.progress?.watched ?? 0;
            const t = m.progress?.total ?? m.episodes ?? 0;
            return (
              <tr key={`${m.id}-${i}`} className="group border-b border-white/5 transition hover:bg-white/[0.04]">
                <td className="py-2.5 pl-3 text-ink-faint">{i + 1}</td>
                <td className="py-2.5 pr-3">
                  <Link href={mediaHref(m)} className="font-medium text-white/90 transition hover:text-brand">{m.title}</Link>
                </td>
                <td className="py-2.5 text-center">{s ? <span className="font-semibold text-brand">{s}</span> : <span className="text-ink-faint">–</span>}</td>
                <td className="py-2.5 text-center text-ink-muted">{t ? `${w} / ${t}` : "–"}</td>
                <td className="py-2.5 pr-3 text-right text-ink-muted">{m.format || "TV"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- one collapsible status section ---------- */
function Section({ label, items, view }: { label: string; items: Media[]; view: "grid" | "list" }) {
  const [open, setOpen] = useState(items.length <= 60);
  const [limit, setLimit] = useState(PAGE);
  if (items.length === 0) return null;
  const shown = items.slice(0, limit);

  return (
    <section className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl panel px-4 py-2.5 text-left transition hover:bg-white/[0.06]"
      >
        <span className="text-sm font-bold uppercase tracking-wide text-white/90">{label}</span>
        <span className="flex items-center gap-2 text-xs text-ink-faint">{open ? "collapse" : "expand"} ({items.length}) <IconChevron open={open} /></span>
      </button>

      {open && (
        <div className="mt-3">
          {view === "grid" ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {shown.map((m, i) => <PosterCard key={`${m.id}-${i}`} m={m} />)}
            </div>
          ) : (
            <ListView items={shown} />
          )}
          {limit < items.length && (
            <div className="mt-4 text-center">
              <button onClick={() => setLimit((l) => l + PAGE * 2)} className="rounded-full panel px-5 py-2 text-sm font-semibold transition hover:bg-white/10">
                Show all {items.length}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- scores distribution ---------- */
function ScoresPanel({ items }: { items: Media[] }) {
  const dist = useMemo(() => {
    const c = Array(11).fill(0);
    items.forEach((m) => { if (m.myRating && m.myRating >= 1 && m.myRating <= 10) c[m.myRating]++; });
    return c;
  }, [items]);
  const max = Math.max(1, ...dist.slice(1));
  const rated = dist.reduce((a, b) => a + b, 0);
  if (rated === 0) return null;
  return (
    <div className="rounded-2xl panel p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Scores</p>
      <div className="space-y-1.5">
        {Array.from({ length: 10 }, (_, k) => 10 - k).map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-white/5">
              <div className="h-full rounded brand-gradient" style={{ width: `${(dist[n] / max) * 100}%` }} />
              {dist[n] > 0 && <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white/80">{dist[n]}</span>}
            </div>
            <span className="w-4 text-right text-xs font-semibold text-ink-faint">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementsPanel({ stats, items }: { stats: Stats; items: Media[] }) {
  const rated = items.filter((m) => (m.myRating ?? 0) > 0).length;
  const days = Math.floor(stats.daysWatched);
  const defs = [
    { Icon: Trophy, title: "Getting Started", desc: "Complete your first title", cur: stats.completed, target: 1 },
    { Icon: Film, title: "Century Club", desc: "Complete 100 titles", cur: stats.completed, target: 100 },
    { Icon: Flame, title: "Unstoppable", desc: "Complete 250 titles", cur: stats.completed, target: 250 },
    { Icon: Star, title: "Critic", desc: "Rate 100 titles", cur: rated, target: 100 },
    { Icon: Clock, title: "Time Sink", desc: "50 days watched", cur: days, target: 50 },
    { Icon: Hourglass, title: "No Life (respect)", desc: "100 days watched", cur: days, target: 100 },
    { Icon: ChartBar, title: "Marathoner", desc: "5,000 episodes", cur: stats.episodesWatched, target: 5000 },
  ];
  const unlocked = defs.filter((a) => a.cur >= a.target).length;

  return (
    <div className="rounded-2xl panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Achievements</p>
        <span className="text-[11px] font-semibold text-brand">{unlocked}/{defs.length}</span>
      </div>
      <div className="space-y-3">
        {defs.map((a) => {
          const done = a.cur >= a.target;
          const pct = Math.min(100, (a.cur / a.target) * 100);
          return (
            <div key={a.title} className="flex items-center gap-3">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${done ? "brand-gradient text-white shadow-glow" : "bg-white/5 text-ink-faint"}`}>
                <a.Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm font-semibold ${done ? "text-white" : "text-ink-muted"}`}>{a.title}</p>
                  {done ? (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand">Unlocked</span>
                  ) : (
                    <span className="shrink-0 text-[10px] tabular-nums text-ink-faint">{Math.min(a.cur, a.target)}/{a.target}</span>
                  )}
                </div>
                <p className="truncate text-[11px] text-ink-faint">{a.desc}</p>
                {!done && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full brand-gradient" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyListClient({ items, stats, name, guest = false }: { items: Media[]; stats: Stats; name: string; guest?: boolean }) {
  const [active, setActive] = useState("all");
  const [cat, setCat] = useState<"all" | "anime" | "cine" | "game">("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [source, setSource] = useState<Media[]>(items);

  // Guests aren't signed in, so their list lives in localStorage. Load it here
  // so "Add to list" actually shows up; fall back to the demo when it's empty.
  useEffect(() => {
    if (!guest) { setSource(items); return; }
    try {
      const list: Media[] = JSON.parse(localStorage.getItem("senkai:list") || "[]");
      const st = JSON.parse(localStorage.getItem("senkai:status") || "{}");
      const rt = JSON.parse(localStorage.getItem("senkai:ratings") || "{}");
      const mine = list.map((m) => ({
        ...m,
        myStatus: st[String(m.id)] || "Planning",
        myRating: rt[String(m.id)] || 0,
        personal: true,
      }));
      setSource(mine.length ? mine : items);
    } catch { setSource(items); }
  }, [guest, items]);

  const catOf = (m: Media) =>
    m.category === "movie" || m.category === "series" ? "cine" : m.category === "game" ? "game" : "anime";

  const catCounts = useMemo(
    () => ({
      all: source.length,
      anime: source.filter((m) => catOf(m) === "anime").length,
      cine: source.filter((m) => catOf(m) === "cine").length,
      game: source.filter((m) => catOf(m) === "game").length,
    }),
    [source],
  );

  const byCat = useMemo(() => (cat === "all" ? source : source.filter((m) => catOf(m) === cat)), [source, cat]);

  const liveStats: Stats = useMemo(() => {
    if (!guest) return stats;
    const by = (s: string) => source.filter((m) => m.myStatus === s).length;
    const eps = source.reduce((n, m) => n + (m.myStatus === "Completed" ? m.episodes || 0 : 0), 0);
    const rated = source.filter((m) => (m.myRating ?? 0) > 0);
    const mean = rated.length ? (rated.reduce((s, m) => s + (m.myRating || 0), 0) / rated.length).toFixed(1) : "0.0";
    return {
      total: source.length, completed: by("Completed"), planning: by("Planning"),
      watching: by("Watching"), dropped: by("Dropped"), episodesWatched: eps,
      meanScore: mean, daysWatched: Math.round(((eps * 23) / 60 / 24) * 10) / 10,
    };
  }, [guest, source, stats]);

  const CATS: { key: typeof cat; label: string }[] = [
    { key: "all", label: "All" },
    { key: "anime", label: "Anime" },
    { key: "cine", label: "Movies & Series" },
    { key: "game", label: "Games" },
  ];

  const countFor = (key: string) => byCat.filter((i) => i.myStatus === key).length;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? byCat.filter((m) => m.title.toLowerCase().includes(term)) : byCat;
  }, [byCat, q]);

  const sections = STATUSES
    .filter((s) => active === "all" || active === s.key)
    .map((s) => ({ ...s, items: filtered.filter((m) => m.myStatus === s.key) }))
    .filter((s) => s.items.length > 0);

  const statusBars = STATUSES.map((s) => ({ ...s, count: countFor(s.key) })).filter((s) => s.count > 0);
  const maxStatus = Math.max(1, ...statusBars.map((s) => s.count));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-8">
      {/* header */}
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full brand-gradient text-2xl font-black uppercase text-white shadow-glow">{name.charAt(0)}</div>
        <div>
          <h1 className="text-2xl font-black capitalize sm:text-3xl">{name}</h1>
          <p className="text-sm text-ink-faint">Personal library · {liveStats.meanScore} avg · {liveStats.daysWatched} days</p>
        </div>
      </div>

      {guest && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl panel-strong p-4 sm:flex-row">
          <p className="text-sm text-ink-muted">You&apos;re viewing a demo library. Sign in to build and sync your own.</p>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-full panel px-4 py-2 text-sm font-semibold transition hover:bg-white/10">Log in</Link>
            <Link href="/register" className="rounded-full brand-gradient px-4 py-2 text-sm font-semibold text-white">Create account</Link>
          </div>
        </div>
      )}

      {/* category tabs */}
      <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => {
          const n = catCounts[c.key];
          if (c.key !== "all" && n === 0) return null;
          return (
            <button
              key={c.key}
              onClick={() => { setCat(c.key); setActive("all"); }}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${cat === c.key ? "brand-gradient text-white shadow-glow" : "panel-strong text-ink-muted hover:text-white"}`}
            >
              {c.label} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {/* status pills */}
      <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActive("all")} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${active === "all" ? "brand-gradient text-white" : "panel text-ink-muted hover:text-white"}`}>All {byCat.length}</button>
        {STATUSES.map((s) => {
          const c = countFor(s.key);
          if (c === 0) return null;
          return (
            <button key={s.key} onClick={() => setActive(s.key)} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${active === s.key ? "brand-gradient text-white" : "panel text-ink-muted hover:text-white"}`}>
              {s.label} <span className="opacity-70">{c}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_290px]">
        {/* main */}
        <div className="min-w-0">
          {/* controls */}
          <div className="flex items-center gap-2 rounded-2xl panel px-3 py-2">
            <span className="text-ink-faint"><IconSearch /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title…" className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint" />
            <div className="flex items-center gap-1 rounded-full bg-black/30 p-1">
              <button onClick={() => setView("list")} aria-label="List view" className={`grid h-7 w-7 place-items-center rounded-full transition ${view === "list" ? "bg-brand text-white" : "text-ink-faint hover:text-white"}`}><IconList on={view === "list"} /></button>
              <button onClick={() => setView("grid")} aria-label="Grid view" className={`grid h-7 w-7 place-items-center rounded-full transition ${view === "grid" ? "bg-brand text-white" : "text-ink-faint hover:text-white"}`}><IconGrid on={view === "grid"} /></button>
            </div>
          </div>

          {sections.length > 0 ? (
            sections.map((s) => <Section key={s.key} label={s.label} items={s.items} view={view} />)
          ) : (
            <div className="py-16 text-center text-ink-faint">
              {q ? `No titles match “${q}”.` : "Nothing here yet."}
              {!q && !guest && <div className="mt-4"><Link href="/browse" className="rounded-full brand-gradient px-6 py-2.5 text-sm font-semibold text-white">Browse titles to add</Link></div>}
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <ScoresPanel items={source} />
          <AchievementsPanel stats={liveStats} items={source} />

          <div className="rounded-2xl panel p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Overview</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Titles", liveStats.total],
                ["Mean score", liveStats.meanScore],
                ["Days watched", liveStats.daysWatched],
                ["Episodes", liveStats.episodesWatched.toLocaleString()],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-xl font-black">{v}</p>
                  <p className="text-[11px] uppercase tracking-wide text-ink-faint">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {statusBars.length > 0 && (
            <div className="rounded-2xl panel p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">By status</p>
              <div className="space-y-2">
                {statusBars.map((s) => (
                  <button key={s.key} onClick={() => setActive(s.key)} className="block w-full text-left">
                    <div className="mb-1 flex justify-between text-[11px]"><span className="text-ink-muted">{s.label}</span><span className="font-semibold">{s.count}</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full brand-gradient" style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
