"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { Mark, User, Lock } from "./icons";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = isLogin ? await login(username, password) : await register(username, password);
    setBusy(false);
    if (res.ok) router.push("/my-list");
    else setError(res.error || "Something went wrong.");
  };

  return (
    <div className="grid min-h-[88vh] place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-9 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl brand-gradient text-white shadow-glow">
            <Mark size={26} />
          </span>
          <h1 className="mt-5 text-3xl font-black lowercase tracking-tight">
            {isLogin ? "welcome back" : "create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {isLogin ? "sign in to your senkai library" : "start tracking your universe"}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field icon={<User size={18} />} type="text" placeholder="username" value={username} onChange={setUsername} autoFocus />
          <Field icon={<Lock size={18} />} type="password" placeholder="password" value={password} onChange={setPassword} />
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <button
            disabled={busy}
            className="mt-2 rounded-xl brand-gradient py-3 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "please wait…" : isLogin ? "log in" : "create account"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-ink-muted">
          {isLogin ? "no account yet? " : "already have one? "}
          <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-brand hover:underline">
            {isLogin ? "create one" : "log in"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoFocus,
}: {
  icon: ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl panel-strong px-4 py-3 transition focus-within:ring-1 focus-within:ring-brand/50">
      <span className="text-ink-faint">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        autoComplete={type === "password" ? "current-password" : "username"}
        className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
      />
    </label>
  );
}
