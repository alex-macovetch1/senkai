import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-6 text-center">
      <div>
        <p className="text-7xl font-black text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold">Lost in the void</h1>
        <p className="mt-2 text-ink-muted">This page drifted off into another dimension.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full brand-gradient px-7 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105"
        >
          ← Back to Senkai
        </Link>
      </div>
    </div>
  );
}
