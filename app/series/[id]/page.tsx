import Link from "next/link";
import type { Metadata } from "next";
import { getCineDetail } from "@/lib/cinemeta";
import CineDetail from "@/components/CineDetail";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = await getCineDetail("series", id);
  if (!m) return { title: "Not found — Senkai" };
  return { title: `${m.title} — Senkai`, description: m.description?.slice(0, 160) || undefined };
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getCineDetail("series", id);

  if (!m) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div>
          <h1 className="text-3xl font-black">Series not found</h1>
          <Link href="/series" className="mt-6 inline-block rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white">
            Back to series
          </Link>
        </div>
      </div>
    );
  }

  return <CineDetail m={m} kindLabel="Series" />;
}
