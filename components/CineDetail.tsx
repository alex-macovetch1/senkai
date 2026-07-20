import Image from "next/image";
import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import TitleActions from "@/components/TitleActions";
import Reveal from "@/components/Reveal";
import type { MediaDetail } from "@/lib/types";

export default function CineDetail({ m, kindLabel }: { m: MediaDetail; kindLabel: string }) {
  const backdrop = m.banner || m.cover;
  const cast = m.characters ?? [];

  const facts: [string, string | number | null | undefined][] = [
    ["Year", m.year],
    ["Runtime", m.duration ? `${m.duration} min` : null],
    ["IMDb", m.score ? (m.score / 10).toFixed(1) : null],
    ["Director", m.studios?.[0]],
    ["Genres", (m.genres || []).slice(0, 3).join(", ") || null],
  ];

  return (
    <article className="pb-16">
      <div className="relative h-[58vh] min-h-[400px] w-full">
        <Image src={backdrop} alt={m.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-[34vh] max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <div>
            <Reveal>
              <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10 md:w-full">
                <Image src={m.cover} alt={m.title} fill sizes="260px" className="object-cover" />
              </div>
            </Reveal>
            <div className="mt-5 hidden md:block">
              <div className="rounded-2xl panel p-4">
                <dl className="space-y-3 text-sm">
                  {facts
                    .filter(([, v]) => v != null && v !== "")
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2">
                        <dt className="text-ink-faint">{k}</dt>
                        <dd className="text-right font-medium">{v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>
          </div>

          <div className="pt-2 md:pt-24">
            <Reveal>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full brand-gradient px-3 py-1 font-bold uppercase tracking-wider text-white">
                  {kindLabel}
                </span>
                {(m.genres || []).slice(0, 5).map((genre) => (
                  <span key={genre} className="rounded-full panel px-3 py-1 font-medium text-ink-muted">
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                <span className="text-gradient">{m.title}</span>
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                {m.score ? (
                  <div className="flex items-center gap-2">
                    <ScoreRing score={m.score} />
                    <div className="text-xs text-ink-faint">
                      <p className="font-semibold text-white">IMDb</p>
                      <p>rating</p>
                    </div>
                  </div>
                ) : null}
                <div className="h-10 w-px bg-white/10" />
                <TitleActions media={m} />
              </div>

              {m.description && (
                <Reveal delay={0.05}>
                  <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                    {m.description}
                  </p>
                </Reveal>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
                {facts
                  .filter(([, v]) => v != null && v !== "")
                  .map(([k, v]) => (
                    <div key={k} className="rounded-xl panel p-3">
                      <p className="text-xs text-ink-faint">{k}</p>
                      <p className="mt-0.5 text-sm font-medium">{v}</p>
                    </div>
                  ))}
              </div>

              {cast.length > 0 && (
                <section className="mt-10">
                  <h2 className="mb-3 text-lg font-bold">Cast</h2>
                  <div className="flex flex-wrap gap-2">
                    {cast.map((c) => (
                      <span key={c.name} className="rounded-full panel px-3 py-1.5 text-sm text-ink-muted">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </Reveal>
          </div>
        </div>
      </div>

      <div className="px-5 pt-8 sm:px-8">
        <Link href={m.category === "series" ? "/series" : "/movies"} className="text-sm text-ink-faint hover:text-white">
          ← Back
        </Link>
      </div>
    </article>
  );
}
