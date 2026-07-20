import Image from "next/image";
import type { Review } from "@/lib/types";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl glass p-5 transition hover:ring-1 hover:ring-brand/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/10">
            {review.avatar ? (
              <Image src={review.avatar} alt={review.user} fill sizes="36px" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center brand-gradient text-xs font-bold">
                {review.user.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold">{review.user}</span>
        </div>
        {review.score != null && (
          <span className="rounded-full bg-brand/20 px-2.5 py-1 text-xs font-bold text-brand">{review.score}/100</span>
        )}
      </div>
      <p className="clamp-4 text-sm leading-relaxed text-ink-muted">{review.summary}</p>
    </div>
  );
}
