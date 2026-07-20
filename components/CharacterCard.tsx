import Image from "next/image";
import type { Character } from "@/lib/types";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="group flex items-center justify-between gap-2 overflow-hidden rounded-xl bg-bg-card ring-1 ring-white/5 transition hover:ring-brand/40">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-14 shrink-0 overflow-hidden">
          {character.image ? (
            <Image src={character.image} alt={character.name} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="h-full w-full shimmer" />
          )}
        </div>
        <div className="min-w-0 py-2">
          <p className="clamp-2 text-xs font-semibold leading-tight">{character.name}</p>
          {character.role && <p className="text-[10px] uppercase tracking-wide text-ink-faint">{character.role.toLowerCase()}</p>}
        </div>
      </div>

      {character.vaName && (
        <div className="flex items-center gap-2 pr-2 text-right">
          <div className="min-w-0 py-2">
            <p className="clamp-2 text-xs font-medium leading-tight text-ink-muted">{character.vaName}</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-faint">JP</p>
          </div>
          {character.vaImage && (
            <div className="relative h-16 w-14 shrink-0 overflow-hidden">
              <Image src={character.vaImage} alt={character.vaName} fill sizes="56px" className="object-cover grayscale transition group-hover:grayscale-0" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
