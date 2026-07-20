import Image from "next/image";
import MediaRow from "@/components/MediaRow";
import { getTopMovies, getMoviesByGenre } from "@/lib/cinemeta";
import { Film } from "@/components/icons";

export const revalidate = 3600;

export const metadata = {
  title: "Movies — Senkai",
  description: "Track movies: top rated and by genre.",
};

export default async function MoviesPage() {
  const [top, animation, action, comedy, drama, thriller, horror] = await Promise.all([
    getTopMovies(),
    getMoviesByGenre("Animation"),
    getMoviesByGenre("Action"),
    getMoviesByGenre("Comedy"),
    getMoviesByGenre("Drama"),
    getMoviesByGenre("Thriller"),
    getMoviesByGenre("Horror"),
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
            <Film size={22} />
            <span className="text-sm font-semibold uppercase tracking-wider">Movies</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Track the films you watch</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Thousands of films with posters, ratings and details — add them to your list.
          </p>
        </div>
      </section>

      <div className="relative z-20 -mt-4 space-y-2">
        <MediaRow title="Top Movies" subtitle="Highest rated right now" items={top} />
        <MediaRow title="Animation" subtitle="Cartoons & animated films" items={animation} />
        <MediaRow title="Action" items={action} />
        <MediaRow title="Comedy" items={comedy} />
        <MediaRow title="Drama" items={drama} />
        <MediaRow title="Thriller" items={thriller} />
        <MediaRow title="Horror" items={horror} />
      </div>
    </div>
  );
}
