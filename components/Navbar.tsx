"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SearchOverlay from "./SearchOverlay";
import { useAuth } from "./AuthProvider";
import { Mark, Search as SearchIcon, Logout } from "./icons";

const LINKS: [string, string][] = [
  ["Home", "/"],
  ["Browse", "/browse"],
  ["Movies", "/browse?format=MOVIE"],
  ["Games", "/games"],
  ["My List", "/my-list"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen && !(e.target as HTMLElement)?.matches?.("input,textarea")) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]) && href !== "/";

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-strong shadow-lg shadow-black/30" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl brand-gradient text-white transition group-hover:rotate-[18deg]">
              <Mark size={16} />
            </span>
            <span className="text-xl font-black lowercase tracking-tight">senkai</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive(href) ? "text-white" : "text-ink-muted hover:text-white"
                }`}
              >
                {isActive(href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full panel px-3 py-2 text-sm text-ink-muted transition hover:text-white"
            >
              <SearchIcon size={16} className="text-brand" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded bg-white/10 px-1.5 text-[10px] leading-5 sm:inline">/</kbd>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/my-list"
                  className="grid h-9 w-9 place-items-center rounded-full brand-gradient text-sm font-bold uppercase text-white"
                  title={user.username}
                >
                  {user.username.charAt(0)}
                </Link>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="hidden h-9 w-9 place-items-center rounded-full panel text-ink-muted transition hover:text-white sm:grid"
                >
                  <Logout size={16} />
                </button>
              </div>
            ) : loading ? (
              <span className="h-9 w-9 rounded-full panel" />
            ) : (
              <Link
                href="/login"
                className="rounded-full brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full panel md:hidden"
              aria-label="menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden border-t border-white/5 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-3">
              {LINKS.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
