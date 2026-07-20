import Image from "next/image";
import MediaRow from "@/components/MediaRow";
import { getTopSeries, getSeriesByGenre } from "@/lib/cinemeta";
import { Layers } from "@/components/icons";

export const revalidate = 3600;

export const metadata = {
  title: "Series — Senkai",
  description: "Track TV series: top rated and by genre.",
};

export default async function SeriesPage() {
  const [top, animation, drama, comedy, crime, action, scifi] = await Promise.all([
    getTopSeries(),
    getSeriesByGenre("Animation"),
    getSeriesByGenre("Drama"),
    getSeriesByGenre("Comedy"),
    getSeriesByGenre("Crime"),
    getSeriesByGenre("Action"),
    getSeriesByGenre("Sci-Fi"),
  ]);

  const backdrop = top.find((m) => m.banner)?.banner ?? null;

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden">
        {backdrop && (
          <>
            <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[var(--background,#0a0a0a)]" />
          </>
        )}
        <div className="relative z-10 px-4 pb-10 pt-28 sm:px-8">
          <div className="mb-3 flex items-center gap-2 text-brand">
            <Layers size={22} />
            <span className="text-sm font-semibold uppercase tracking-wider">Series</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Track the shows you binge</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            TV series with posters, ratings and details — build your watchlist.
          </p>
        </div>
      </section>

      <div className="relative z-20 -mt-4 space-y-2">
        <MediaRow title="Top Series" subtitle="Highest rated right now" items={top} />
        <MediaRow title="Animation" subtitle="Cartoons & animated series" items={animation} />
        <MediaRow title="Drama" items={drama} />
        <MediaRow title="Comedy" items={comedy} />
        <MediaRow title="Crime" items={crime} />
        <MediaRow title="Action" items={action} />
        <MediaRow title="Sci-Fi" items={scifi} />
      </div>
    </div>
  );
}
