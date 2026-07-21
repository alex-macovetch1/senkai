import MyListClient from "@/components/MyListClient";
import { getCurrentUser } from "@/lib/auth";
import { getLibrary, type LibEntry } from "@/lib/db";
import type { Media } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "My List — Senkai" };

function computeStats(lib: LibEntry[]) {
  const total = lib.length;
  const by = (s: string) => lib.filter((e) => e.status === s).length;
  const episodesWatched = lib.reduce(
    (sum, e) => sum + (e.status === "Completed" ? e.media.episodes || e.media.progress?.watched || 0 : e.media.progress?.watched || 0),
    0,
  );
  const rated = lib.filter((e) => e.rating > 0);
  const meanScore = rated.length ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1) : "0.0";
  return {
    total,
    completed: by("Completed"),
    planning: by("Planning"),
    watching: by("Watching"),
    dropped: by("Dropped"),
    episodesWatched,
    meanScore,
    daysWatched: Math.round(((episodesWatched * 23) / 60 / 24) * 10) / 10,
  };
}

export default async function MyListPage() {
  const user = await getCurrentUser();

  if (!user) {
    // Not signed in: no demo library — show an empty list with a sign-in prompt.
    return <MyListClient name="Guest" items={[]} stats={computeStats([])} guest />;
  }

  const lib = await getLibrary(user.id);
  const items: Media[] = lib.map((e) => ({
    ...e.media,
    myStatus: e.status,
    myRating: e.rating,
    personal: true,
  }));

  return <MyListClient name={user.username} items={items} stats={computeStats(lib)} />;
}
