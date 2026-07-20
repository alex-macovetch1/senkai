import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import MediaRow from "@/components/MediaRow";
import Reveal from "@/components/Reveal";
import {
  getTrending,
  getPopular,
  getTopRated,
  getAiring,
  getMovies,
  getByGenre,
} from "@/lib/anilist";
import { continueWatching, topRatedByMe, planned } from "@/lib/mylist";
import { mediaHref } from "@/lib/types";
import { Mark, Star, ArrowRight } from "@/components/icons";

export const revalidate = 3600;

const GENRE_PILLS = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life", "Supernatural", "Thriller"];

export default async function Home() {
  // Sequential (not Promise.all) to stay under AniList's rate limit — results are cached 1h.
  const trending = await getTrending();
  const airing = await getAiring();
  const popular = await getPopular();
  const topRated = await getTopRated();
  const movies = await getMovies();
  const action = await getByGenre("Action");
  const romance = await getByGenre("Romance");
  const fantasy = await getByGenre("Fantasy");
  const scifi = await getByGenre("Sci-Fi");

  const spotlight = topRated.find((m) => m.banner) || trending.find((m) => m.banner);

  return (
    <div className="pb-10">
      <Hero items={trending} />

      {/* content rows overlap hero slightly */}
      <div className="relative z-20 -mt-8 space-y-2">
        {/* genre pills */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-8">
          {GENRE_PILLS.map((g) => (
            <Link
              key={g}
              href={`/browse?genre=${encodeURIComponent(g)}`}
              className="shrink-0 rounded-full panel px-4 py-2 text-sm text-ink-muted transition hover:bg-brand/20 hover:text-white"
            >
              {g}
            </Link>
          ))}
        </div>

        {continueWatching.length >= 3 && (
          <MediaRow title="Continue Watching" subtitle="Pick up where you left off" items={continueWatching} href="/my-list" />
        )}

        <MediaRow title="Trending Now" subtitle="What everyone is watching" items={trending} href="/browse?sort=TRENDING_DESC" />

        <MediaRow title="Airing This Season" items={airing} href="/browse?sort=POPULARITY_DESC&status=RELEASING" />

        {topRatedByMe.length > 0 && (
          <MediaRow title="Your Top Rated" subtitle="From your personal list" items={topRatedByMe} href="/my-list" />
        )}

        {/* spotlight band */}
        {spotlight && <Spotlight />}

        <MediaRow title="All-Time Popular" items={popular} href="/browse?sort=POPULARITY_DESC" />
        <MediaRow title="Top Rated of All Time" items={topRated} href="/browse?sort=SCORE_DESC" />
        <MediaRow title="Action & Adrenaline" items={action} href="/browse?genre=Action" />
        <MediaRow title="Anime Movies" items={movies} href="/browse?format=MOVIE" />
        <MediaRow title="Romance Picks" items={romance} href="/browse?genre=Romance" />

        {planned.length > 0 && (
          <MediaRow title="Your Watchlist" subtitle="Planning to watch" items={planned} href="/my-list" />
        )}

        <MediaRow title="Fantasy Worlds" items={fantasy} href="/browse?genre=Fantasy" />
        <MediaRow title="Sci-Fi & Mecha" items={scifi} href="/browse?genre=Sci-Fi" />
      </div>
    </div>
  );

  function Spotlight() {
    if (!spotlight) return null;
    const score = spotlight.score ? (spotlight.score / 10).toFixed(1) : null;
    return (
      <Reveal className="px-4 py-6 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/8">
          {spotlight.banner && (
            <Image src={spotlight.banner} alt={spotlight.title} fill sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/30" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_10%_50%,rgba(168,85,247,0.25),transparent)]" />
          <div className="relative flex flex-col gap-4 p-8 sm:max-w-lg sm:p-12">
            <span className="flex w-fit items-center gap-1.5 rounded-full brand-gradient px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <Mark size={12} /> Editor&apos;s Spotlight
            </span>
            <h3 className="text-3xl font-black leading-tight sm:text-4xl">{spotlight.title}</h3>
            <div className="flex items-center gap-3 text-sm text-ink-muted">
              {score && (
                <span className="flex items-center gap-1 font-bold text-accent">
                  <Star size={14} /> {score}
                </span>
              )}
              {spotlight.year && <span>{spotlight.year}</span>}
              {spotlight.format && <span>{spotlight.format.replace(/_/g, " ")}</span>}
            </div>
            <p className="clamp-3 text-sm text-ink-muted">{spotlight.description}</p>
            <Link
              href={mediaHref(spotlight)}
              className="mt-1 flex w-fit items-center gap-2 rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]"
            >
              Explore title <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Reveal>
    );
  }
}
