import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getMediaDetail } from "@/lib/anilist";
import ScoreRing from "@/components/ScoreRing";
import CharacterCard from "@/components/CharacterCard";
import ReviewCard from "@/components/ReviewCard";
import MediaRow from "@/components/MediaRow";
import Reveal from "@/components/Reveal";
import TitleActions from "@/components/TitleActions";
import type { Media } from "@/lib/types";

export const revalidate = 3600;

function parseParam(raw: string): { id?: number; idMal?: number } {
  if (raw.startsWith("m")) return { idMal: Number(raw.slice(1)) };
  return { id: Number(raw) };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMediaDetail(parseParam(id));
  if (!detail) return { title: "Not found — Senkai" };
  return {
    title: `${detail.title} — Senkai`,
    description: detail.description?.slice(0, 160) || undefined,
  };
}

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getMediaDetail(parseParam(id));

  if (!m) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div>
          <h1 className="text-3xl font-black">Title not found</h1>
          <p className="mt-2 text-ink-muted">We couldn&apos;t load this one. It may have been removed.</p>
          <Link href="/" className="mt-6 inline-block rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const backdrop = m.banner || m.cover;
  const relatedMedia: Media[] = (m.relations || []).map((r) => r.media);

  const facts: [string, string | number | null | undefined][] = [
    ["Format", m.format?.replace(/_/g, " ")],
    ["Episodes", m.episodes],
    ["Duration", m.duration ? `${m.duration} min` : null],
    ["Status", m.status?.replace(/_/g, " ").toLowerCase()],
    ["Season", m.season && m.year ? `${m.season.toLowerCase()} ${m.year}` : m.year],
    ["Studio", m.studios?.[0]],
    ["Popularity", m.popularity ? `#${Math.max(1, Math.round(1_000_000 / (m.popularity + 1000)))}` : null],
  ];

  return (
    <article className="pb-16">
      {/* backdrop */}
      <div className="relative h-[58vh] min-h-[400px] w-full">
        <Image src={backdrop} alt={m.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-[34vh] max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* left column */}
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
                        <dd className="text-right font-medium capitalize">{v}</dd>
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
                {(m.genres || []).slice(0, 5).map((g) => (
                  <Link
                    key={g}
                    href={`/browse?genre=${encodeURIComponent(g)}`}
                    className="rounded-full panel px-3 py-1 font-medium text-ink-muted transition hover:bg-brand/20 hover:text-white"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                <span className="text-gradient">{m.title}</span>
              </h1>
              {m.titleSecondary && <p className="mt-2 text-ink-muted">{m.titleSecondary}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-5">
                {m.score ? (
                  <div className="flex items-center gap-2">
                    <ScoreRing score={m.score} />
                    <div className="text-xs text-ink-faint">
                      <p className="font-semibold text-white">Rating</p>
                      <p>community</p>
                    </div>
                  </div>
                ) : null}
                <div className="h-10 w-px bg-white/10" />
                <TitleActions media={m} trailerId={m.trailer?.id} />
              </div>

              {m.description && (
                <Reveal delay={0.05}>
                  <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                    {m.description}
                  </p>
                </Reveal>
              )}

              {/* mobile facts */}
              <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
                {facts
                  .filter(([, v]) => v != null && v !== "")
                  .map(([k, v]) => (
                    <div key={k} className="rounded-xl panel p-3">
                      <p className="text-[11px] text-ink-faint">{k}</p>
                      <p className="text-sm font-semibold capitalize">{v}</p>
                    </div>
                  ))}
              </div>

              {m.tags && m.tags.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-xs uppercase tracking-wider text-ink-faint">Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {m.tags.map((t) => (
                      <span key={t} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-ink-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>

        {/* characters */}
        {m.characters && m.characters.length > 0 && (
          <Reveal className="mt-16">
            <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
              <span className="h-5 w-1.5 rounded-full brand-gradient" /> Characters &amp; Voice Cast
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {m.characters.map((c, i) => (
                <CharacterCard key={i} character={c} />
              ))}
            </div>
          </Reveal>
        )}
      </div>

      {/* related + recommendations (full width rows) */}
      {relatedMedia.length > 0 && (
        <div className="mt-12">
          <MediaRow title="Related Titles" items={relatedMedia} />
        </div>
      )}
      {m.recommendations && m.recommendations.length > 0 && (
        <div className="mt-2">
          <MediaRow title="More Like This" items={m.recommendations} />
        </div>
      )}

      {/* reviews */}
      {m.reviews && m.reviews.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mt-14">
            <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
              <span className="h-5 w-1.5 rounded-full brand-gradient" /> User Reviews
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {m.reviews.map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>
          </Reveal>
        </div>
      )}
    </article>
  );
}
