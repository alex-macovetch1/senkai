# Senkai — cinematic anime & media tracker

A dark, cinematic streaming-style web app for tracking anime, movies and series —
browse a huge live catalog, open rich detail pages, and keep your own rated list
behind a real account.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## Fullstack, not just a UI

Senkai has a real backend, not only a pretty front end:

- **Accounts & auth** — register / login / logout with salted password hashing
  (`lib/auth.ts`) and server-side sessions via HTTP-only cookies
- **Personal library API** — `POST/GET /api/library` saves each user's titles,
  status (Watching / Completed / Planning / Dropped / Favorite) and rating
- **Live catalog** — hundreds of titles, HD posters, trailers, characters and
  cast pulled server-side from the free **AniList GraphQL API** (cached 1h)
- Storage is a small isolated module (`lib/db.ts`) so it can be swapped from the
  local JSON store to Postgres without touching the rest of the app

## Pages

| Page | Route | Highlights |
|------|-------|-----------|
| **Home** | `/` | Rotating cinematic hero, multiple content rows (Trending, Airing, Top Rated, genres, Movies) |
| **Title** | `/title/[id]` | Cinematic backdrop, score ring, genres, studios, **characters + voice cast**, trailer, recommendations, reviews |
| **Browse** | `/browse` | Live filtering by genre / format / sort + "load more" |
| **Search** | overlay (press `/`) & `/search` | Instant results as you type |
| **My List** | `/my-list` | Profile, stat tiles, status tabs, your saved & rated titles |
| **Auth** | `/login`, `/register` | Real accounts backed by the auth API |

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Structure

```
app/
├── api/
│   ├── auth/{login,logout,me,register}/route.ts   # auth endpoints
│   └── library/route.ts                            # personal library CRUD
├── browse · search · my-list · title/[id] · login · register · page.tsx
components/   Hero, MediaRow, MediaCard, Navbar, SearchOverlay, CinematicPlayer,
              ScoreRing, TitleActions, CharacterCard, ReviewCard, MyListClient, ...
lib/
├── anilist.ts   # AniList GraphQL client
├── auth.ts      # hashing, sessions
├── db.ts        # storage layer (JSON now, Postgres-ready)
└── types.ts
data/            lista-mea.json — 242-title personal seed
```

## Data notes

- Catalog + detail pages fetch **AniList** server-side. "Movies" = AniList
  `format: MOVIE`; live-action would need a TMDB key (future).
- Images are served directly from AniList's CDN (`next.config.ts → images.unoptimized`).

## Roadmap

- [ ] Swap the local JSON store (`lib/db.ts`) for **Supabase / Postgres** so the
      live deployment persists accounts and libraries across sessions
- [ ] Deploy to Vercel once storage is cloud-backed
- [ ] TMDB integration for live-action movies & series
- [ ] Episode progress tracking

---

Built by [Alexandru Macovetchi](https://github.com/alex-macovetch1) ·
[portfolio](https://alex-macovetch1.github.io/portofoliu/)
