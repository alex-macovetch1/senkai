import Image from "next/image";
import MediaRow from "@/components/MediaRow";
import {
  getPopularGames,
  getTopGames,
  getNewGames,
  getGamesByGenre,
} from "@/lib/rawg";
import { Mark } from "@/components/icons";

export const revalidate = 3600;

export const metadata = {
  title: "Games — Senkai",
  description: "Browse games: popular, top rated, new releases and by genre.",
};

export default async function GamesPage() {
  // parallel — RAWG handles concurrent requests fine; all cached 1h
  const [popular, top, fresh, action, rpg, shooter, adventure] = await Promise.all([
    getPopularGames(),
    getTopGames(),
    getNewGames(),
    getGamesByGenre("action"),
    getGamesByGenre("role-playing-games-rpg"),
    getGamesByGenre("shooter"),
    getGamesByGenre("adventure"),
  ]);

  const backdrop = popular.find((g) => g.banner)?.banner ?? null;

  return (
    <div className="pb-10">
      {/* header band */}
      <section className="relative overflow-hidden">
        {backdrop && (
          <>
            <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[var(--background,#0a0a0a)]" />
          </>
        )}
        <div className="relative z-10 px-4 pb-10 pt-28 sm:px-8">
          <div className="mb-3 flex items-center gap-2 text-brand">
            <Mark size={22} />
            <span className="text-sm font-semibold uppercase tracking-wider">Games</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Track the games you play</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Powered by the RAWG database — browse thousands of titles, open a game for details and screenshots.
          </p>
        </div>
      </section>

      <div className="relative z-20 -mt-4 space-y-2">
        <MediaRow title="Popular Right Now" subtitle="What everyone is playing" items={popular} />
        <MediaRow title="Top Rated" subtitle="Highest Metacritic scores" items={top} />
        <MediaRow title="New Releases" items={fresh} />
        <MediaRow title="Action" items={action} />
        <MediaRow title="RPG" items={rpg} />
        <MediaRow title="Shooters" items={shooter} />
        <MediaRow title="Adventure" items={adventure} />
      </div>
    </div>
  );
}
