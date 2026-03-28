# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PackWalk is a realtime dog-walking meetup platform. Users create profiles with their dogs, start walk sessions with privacy/visibility controls, and discover nearby walkers on a live map. Built as a monorepo with npm workspaces.

## Monorepo Layout

```
apps/web/         → Next.js 16 app (the active codebase)
apps/mobile/      → Reserved for Expo/React Native (not started)
packages/shared/  → Reserved for shared types/validation (empty)
supabase/         → Database migrations (sequential 0001–0004)
docs/             → Product specs (mvp-scope, user-flows) and architecture docs
```

## Commands

```bash
npm run dev:web       # Start Next.js dev server (Turbopack)
npm run build:web     # Production build
npm run lint:web      # ESLint
```

These are root-level shortcuts. The web app itself uses standard `next dev`, `next build`, `eslint .`.

## Tech Stack

- **Next.js 16.2.1** with App Router, React 19, TypeScript 5
- **Tailwind CSS 4** (CSS-first config via `@tailwindcss/postcss`)
- **Supabase** for auth (email/password with SSR cookie sessions), database (PostgreSQL + RLS), and realtime
- **Mapbox GL 3 + react-map-gl 8** for the live map
- **TanStack Query 5** for data fetching
- **Zod 4** for validation (used in server actions)
- **Zustand 5** for client state (installed, not yet in use)

## Next.js 16 Warning

This project uses Next.js 16 which has breaking API changes. **Read `node_modules/next/dist/docs/` before writing any code** that touches Next.js APIs or conventions. See `apps/web/AGENTS.md`.

## Architecture

### Auth Flow
Supabase Auth with SSR. Server-side client created via `lib/supabase/server.ts`, browser client via `lib/supabase/browser.ts`. On signup, `lib/supabase/profiles.ts:ensureProfile` auto-creates a `profiles` row with a generated username. No middleware file exists yet.

### Server Actions
Form handlers in colocated `actions.ts` files using Zod validation:
- `app/auth/actions.ts` — signUp, signIn, signOut
- `app/dashboard/actions.ts` — createDogProfile, startWalkSession, endWalkSession
- `app/map/actions.ts` — followWalker, unfollowWalker

### Routes
`/` landing, `/sign-up`, `/sign-in`, `/dashboard` (walk management + dog profiles), `/map` (live discovery), `/profile` (settings + connections)

### Database
Supabase PostgreSQL with RLS. Migrations in `supabase/migrations/`. Key tables: `profiles`, `dogs`, `walk_sessions`, `location_pings`, `follows`, `groups`, `group_members`, `group_messages`, `notifications`. Key enums: `visibility` (public/followers/private_group), `location_precision` (exact/approximate), `walk_status` (active/ended/expired).

### Privacy Model
Per-walk-session visibility and location precision controls — not just global settings. RLS policies enforce this at the database level.

### UI Conventions
- Custom CSS variables for theming (`--text-strong`, `--text-body`, `--accent-strong`, etc.)
- Glassmorphism style (semi-transparent backgrounds, soft borders)
- Mobile-first with `sm:`/`lg:` breakpoints
- Components organized by feature domain under `components/` (auth, dashboard, map, navigation, profile, ui)

### Mapbox
Use **uncontrolled mode** with `initialViewState` + `mapRef` (not controlled `viewState`). This ensures markers follow pan/zoom correctly.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
NEXT_PUBLIC_MAPBOX_TOKEN
```

Validated in `apps/web/src/lib/env.ts`.
