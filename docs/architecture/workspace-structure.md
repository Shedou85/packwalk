# PackWalk Workspace Structure

## Structure

- `apps/web`
  Web app built with Next.js, TypeScript, Tailwind CSS, TanStack Query, Zustand, and Mapbox.
- `apps/mobile`
  Reserved for a future Expo / React Native app.
- `packages/shared`
  Shared types, validation schemas, helpers, and constants reused across apps.
- `docs/product`
  Product requirements, flows, and scope decisions.
- `docs/architecture`
  Technical notes, architecture records, and integration decisions.
- `supabase`
  Database schema, policies, and migration files.

## Why This Shape

- It supports a web-first launch without blocking a later mobile app.
- Shared logic can move into `packages/shared` as the mobile app arrives.
- Product and schema decisions stay documented next to the codebase.
- Supabase setup remains versioned and visible from the start.
