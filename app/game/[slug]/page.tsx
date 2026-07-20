import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getGameDetail } from "@/lib/rawg";
import ScoreRing from "@/components/ScoreRing";
import TitleActions from "@/components/TitleActions";
import Reveal from "@/components/Reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGameDetail(slug);
  if (!g) return { title: "Not found — Senkai" };
  return {
    title: `${g.title} — Senkai`,
    description: g.description?.slice(0, 160) || undefined,
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await getGameDetail(slug);

  if (!g) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div>
          <h1 className="text-3xl font-black">Game not found</h1>
          <p className="mt-2 text-ink-muted">We couldn&apos;t load this one.</p>
          <Link href="/games" className="mt-6 inline-block rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white">
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  const shots: string[] = (g as unknown as { screenshots?: string[] }).screenshots ?? [];
  const backdrop = g.banner || g.cover;

  const facts: [string, string | number | null | undefined][] = [
    ["Released", g.year],
    ["Developer", g.studios?.[0]],
    ["Metacritic", g.score],
    ["Genres", (g.genres || []).slice(0, 3).join(", ") || null],
  ];

  return (
    <article className="pb-16">
      {/* backdrop */}
      <div className="relative h-[58vh] min-h-[400px] w-full">
        <Image src={backdrop} alt={g.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-[34vh] max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* left column */}
          <div>
            <Reveal>
              <div className="relative aspect-[3/4] w-48 overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10 md:w-full">
                <Image src={g.cover} alt={g.title} fill sizes="260px" className="object-cover" />
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

          {/* right column */}
          <div className="pt-2 md:pt-24">
            <Reveal>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full brand-gradient px-3 py-1 font-bold uppercase tracking-wider text-white">
                  Game
                </span>
                {(g.genres || []).slice(0, 5).map((genre) => (
                  <span key={genre} className="rounded-full panel px-3 py-1 font-medium text-ink-muted">
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                <span className="text-gradient">{g.title}</span>
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                {g.score ? (
                  <div className="flex items-center gap-2">
                    <ScoreRing score={g.score} />
                    <div className="text-xs text-ink-faint">
                      <p className="font-semibold text-white">Metacritic</p>
                      <p>score</p>
                    </div>
                  </div>
                ) : null}
                <div className="h-10 w-px bg-white/10" />
                <TitleActions media={g} />
              </div>

              {g.description && (
                <Reveal delay={0.05}>
                  <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                    {g.description}
                  </p>
                </Reveal>
              )}

              {/* mobile facts */}
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
            </Reveal>

            {/* screenshots */}
            {shots.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-lg font-bold">Screenshots</h2>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
                  {shots.map((src) => (
                    <div
                      key={src}
                      className="relative aspect-video w-72 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10"
                    >
                      <Image src={src} alt="" fill sizes="288px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
