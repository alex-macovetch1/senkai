"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Media } from "@/lib/types";
import { entryKey } from "@/lib/types";

interface PublicUser {
  id: string;
  username: string;
}
interface LibItem {
  status: string;
  rating: number;
}
interface AuthResult {
  ok: boolean;
  error?: string;
}
interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  library: Record<string, LibItem>;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  setEntry: (media: Media, patch: { status?: string; rating?: number }) => Promise<void>;
  removeEntry: (media: Media) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [library, setLibrary] = useState<Record<string, LibItem>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const j = await r.json();
      setUser(j.user);
      const map: Record<string, LibItem> = {};
      for (const e of j.library || []) map[e.key] = { status: e.status, rating: e.rating };
      setLibrary(map);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load the current user from the server on mount
    refresh();
  }, [refresh]);

  const auth = async (path: string, username: string, password: string): Promise<AuthResult> => {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error || "Something went wrong." };
    await refresh();
    return { ok: true };
  };

  const login = (u: string, p: string) => auth("/api/auth/login", u, p);
  const register = (u: string, p: string) => auth("/api/auth/register", u, p);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLibrary({});
  };

  const setEntry = async (media: Media, patch: { status?: string; rating?: number }) => {
    const key = entryKey(media);
    setLibrary((prev) => ({
      ...prev,
      [key]: {
        status: patch.status ?? prev[key]?.status ?? "Planning",
        rating: patch.rating ?? prev[key]?.rating ?? 0,
      },
    }));
    await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media, ...patch }),
    });
  };

  const removeEntry = async (media: Media) => {
    const key = entryKey(media);
    setLibrary((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    await fetch(`/api/library?key=${encodeURIComponent(key)}`, { method: "DELETE" });
  };

  return (
    <Ctx.Provider value={{ user, loading, library, refresh, login, register, logout, setEntry, removeEntry }}>
      {children}
    </Ctx.Provider>
  );
}
