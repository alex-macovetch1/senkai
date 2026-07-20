import { Mark } from "@/components/icons";

export default function Loading() {
  return (
    <div className="grid min-h-[80vh] place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-brand" />
          <span className="absolute inset-2 grid place-items-center rounded-full brand-gradient text-white">
            <Mark size={22} />
          </span>
        </div>
        <p className="animate-pulse text-sm tracking-[0.3em] text-ink-muted">LOADING</p>
      </div>
    </div>
  );
}
