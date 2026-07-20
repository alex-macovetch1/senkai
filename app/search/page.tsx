import BrowseClient from "@/components/BrowseClient";

export const metadata = { title: "Search — Senkai" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return <BrowseClient searchMode initial={{ q: sp.q }} />;
}
