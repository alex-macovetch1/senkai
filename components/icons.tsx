import type { SVGProps } from "react";

/* Premium line-icon set — replaces all emoji. 24px grid, 1.75 stroke, currentColor. */

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, fill = "none", ...rest }: P & { children: React.ReactNode; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* Brand mark — a sleek 4-point star (not an emoji). */
export function Mark({ size = 20, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M12 1.5c.4 4.7 2.3 7.8 6.9 8.9.6.15.6 1.05 0 1.2-4.6 1.1-6.5 4.2-6.9 8.9-.05.55-.95.55-1 0-.4-4.7-2.3-7.8-6.9-8.9-.6-.15-.6-1.05 0-1.2 4.6-1.1 6.5-4.2 6.9-8.9.05-.55.95-.55 1 0Z" />
    </svg>
  );
}

export const Search = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Svg>
);
export const Play = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.87l12-7.5a1 1 0 0 0 0-1.74l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </Svg>
);
export const Pause = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
  </Svg>
);
export const Prev = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M18 5.5v13a1 1 0 0 1-1.5.86L8 14.3V19a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0v4.7l8.5-5.06A1 1 0 0 1 18 5.5Z" />
  </Svg>
);
export const Next = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M6 5.5v13a1 1 0 0 0 1.5.86L16 14.3V19a1 1 0 0 0 2 0V5a1 1 0 0 0-2 0v4.7L7.5 4.64A1 1 0 0 0 6 5.5Z" />
  </Svg>
);
export const Skip = (p: P) => (
  <Svg {...p}>
    <path d="M4 5v14l9-7z" fill="currentColor" stroke="none" />
    <path d="M14 5v14l9-7z" fill="currentColor" stroke="none" />
  </Svg>
);
export const Info = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.75v.5" />
  </Svg>
);
export const Star = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 2.5l2.7 5.9 6.3.7-4.7 4.3 1.3 6.3L12 16.9 6.1 20l1.3-6.3L2.7 9.4l6.3-.7L12 2.5Z" />
  </Svg>
);
export const Plus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const Check = (p: P) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5 11-11" />
  </Svg>
);
export const ChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);
export const ChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);
export const ArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Svg>
);
export const Close = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const Subtitles = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M7 14h4M13 14h4M7 10.5h2M11 10.5h6" />
  </Svg>
);
export const Settings = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Svg>
);
export const Fullscreen = (p: P) => (
  <Svg {...p}>
    <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
  </Svg>
);
export const Share = (p: P) => (
  <Svg {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
  </Svg>
);
export const Sound = (p: P) => (
  <Svg {...p}>
    <path d="M4 9v6h3l5 4V5L7 9H4Z" fill="currentColor" stroke="none" />
    <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" />
  </Svg>
);

/* achievements */
export const Trophy = (p: P) => (
  <Svg {...p}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 20h6M12 13v3" />
  </Svg>
);
export const Flame = (p: P) => (
  <Svg {...p}>
    <path d="M12 3c1 3.5 4.5 4.8 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.4.6-2.4 1.3-3.2.2 1 .8 1.7 1.6 2 0-2.3.4-5 1.6-7.3Z" />
  </Svg>
);
export const Compass = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" fill="currentColor" stroke="none" />
  </Svg>
);
export const Hourglass = (p: P) => (
  <Svg {...p}>
    <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
  </Svg>
);
export const Feather = (p: P) => (
  <Svg {...p}>
    <path d="M20 4c-6 0-11 3-13 9l-3 7 7-3c6-2 9-7 9-13ZM7 17l6-6" />
  </Svg>
);
export const Film = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" />
  </Svg>
);

/* account / cabinet */
export const User = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 19.5a7 7 0 0 1 14 0" />
  </Svg>
);
export const Bookmark = (p: P) => (
  <Svg {...p}>
    <path d="M6 4h12v16l-6-4-6 4V4Z" />
  </Svg>
);
export const Heart = (p: P) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-9.3-8.7C1.3 8.6 2.6 5.5 5.6 5.1c1.9-.2 3.4.9 4.4 2.3 1-1.4 2.5-2.5 4.4-2.3 3 .4 4.3 3.5 2.9 6.2C19 15.6 12 20 12 20Z" />
  </Svg>
);
export const Clock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const ChartBar = (p: P) => (
  <Svg {...p}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </Svg>
);
export const Layers = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 16.5l9 5 9-5" />
  </Svg>
);
export const History = (p: P) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4M12 7.5V12l3 2" />
  </Svg>
);
export const Grid = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);
export const Logout = (p: P) => (
  <Svg {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12H3M6 8l-4 4 4 4" />
  </Svg>
);
export const Mail = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);
export const Lock = (p: P) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Svg>
);
