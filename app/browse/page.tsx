import BrowseClient from "@/components/BrowseClient";

export const metadata = { title: "Browse — Senkai" };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <BrowseClient
      initial={{ genre: sp.genre, format: sp.format, sort: sp.sort, status: sp.status, q: sp.q }}
    />
  );
}
