import Link from "next/link";
import { Mark } from "./icons";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl brand-gradient text-white">
                <Mark size={16} />
              </span>
              <span className="text-xl font-black lowercase tracking-tight">senkai</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              Your cinematic universe for anime, movies and series. Track, discover and relive
              every story — beautifully.
            </p>
          </div>

          <FooterCol title="Explore" links={[["Home", "/"], ["Browse", "/browse"], ["Movies", "/browse?format=MOVIE"], ["Top Rated", "/browse?sort=SCORE_DESC"]]} />
          <FooterCol title="Library" links={[["My List", "/my-list"], ["Continue", "/my-list"], ["Planning", "/my-list"], ["Completed", "/my-list"]]} />
          <FooterCol title="About" links={[["Data by AniList", "https://anilist.co"], ["Made for Alex", "/"], ["Senkai v2", "/"]]} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Senkai — a personal media universe.</p>
          <p>Metadata &amp; imagery courtesy of AniList. Built with Next.js.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2 text-sm text-ink-muted">
        {links.map(([label, href]) => (
          <li key={label + href}>
            <Link href={href} className="transition hover:text-brand">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
