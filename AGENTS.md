<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Next.js 16 has breaking changes — middleware is now `proxy.ts`, APIs and conventions differ from training data. Read `node_modules/next/dist/docs/` before writing framework code.
<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16.2.10 · React 19 · Tailwind v4 · TypeScript 5 · Better Auth · MongoDB + Mongoose · Zod

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | **Only verification step** — typecheck runs inside `next build` |
| `npm run lint` | ESLint (next/core-web-vitals + typescript) |

No test runner. No standalone typecheck script. Always run `npm run build` to verify changes.

## Project structure

```
app/                    — App Router at root (no src/)
  (app)/                — Route group: authenticated app shell (sidebar + topbar)
    dashboard/          — user role
    admin/              — admin role (role-gated in layout)
    support/            — support + admin roles
  api/                  — route handlers
  *.tsx                 — marketing site (home, about, services, etc.)
components/             — "use client" components (all client-side)
lib/
  actions/              — "use server" files (RPC boundary, safe to import from client)
  services/             — server-only (NO "use server" — never import from client components)
  events/               — EventBus pub/sub + handlers
  auth.ts               — Better Auth server config
  auth-client.ts        — Better Auth React client
  mongoose.ts           — Mongoose connection singleton
  mongodb.ts            — Native driver (Better Auth ONLY)
  utils/serialize.ts    — ObjectId → string conversion for RSC boundary
models/                 — Mongoose schemas (one file per collection)
proxy.ts                — Next.js 16 middleware (renamed from middleware.ts)
instrumentation.ts      — Registers event handlers on server startup
```

## Critical rules

### Mongoose must never reach the client bundle

Mongoose imports `async_hooks`/`child_process` which don't exist in browsers. This causes build failures.

- **`lib/actions/*.ts`** — have `"use server"` at top. Safe to import from client components (Next.js creates RPC boundary).
- **`lib/services/*.ts`** — NO `"use server"`. These import Mongoose directly. **Never import from client components.**
- Client components that need service data must call API routes (`app/api/...`) or server actions instead.

### Serialize Mongoose documents before returning

MongoDB `ObjectId` is not serializable across the RSC boundary. Every server action / route handler that returns a Mongoose document must wrap it:

```ts
import { serialize, serializeArray } from "@/lib/utils/serialize";
return serialize(doc.toObject());        // single
return serializeArray(docs.map(d => d.toObject()));  // array
```

### Dual database access — don't mix

- **`lib/mongodb.ts`** (native MongoDB driver) — used ONLY by Better Auth (`lib/auth.ts`).
- **`lib/mongoose.ts`** (Mongoose) — used by ALL app code, models, and server actions.
- Both point at the same `MONGODB_URI` (default: `mongodb://localhost:27017/bpo`).

### User model coexists with Better Auth

`models/User.ts` uses `strict: false` and `collection: "user"` so Better Auth can write to the same collection without schema conflicts. Don't change these settings.

### proxy.ts — public paths use prefix matching

`publicPaths.some(path => pathname === path || pathname.startsWith(path))`. Never add a broad prefix like `/api/chat` — it would expose all sub-routes (`/api/chat/user`, `/api/chat/admin`). Add specific paths only (e.g. `/api/chat/guest`).

## Auth

- **Better Auth** with email/password + optional Google OAuth + admin plugin
- Roles: `admin`, `user`, `support` (default: `user`)
- Role-gating happens in `app/(app)/layout.tsx` (client-side redirect)
- Session cookie: `better-auth.session`
- **Sign-in gotcha:** After `signIn()`, use `window.location.href = "/dashboard"` (hard redirect) — `router.push()` causes a session race condition where the session isn't ready on the target page

## Tailwind v4

- `@import "tailwindcss"` in `app/globals.css` — no `@tailwind base/components/utilities`
- Theme defined via `@theme inline` in globals.css — no `tailwind.config`
- All colors use bracket notation (`bg-[#292524]`) — no named Tailwind colors except `text-white`
- Heading tags (`h1`–`h6`) inherit `font-display` + `color: var(--color-ink)` from `@layer base` — use explicit `text-[#fafafa]` to override on dark backgrounds
- Cards use plain borders (`border border-hairline`), not `rounded-2xl`

## Design tokens

- **Display font:** EB Garamond (`font-display`), **Body:** Inter (`font-sans`)
- Key colors: canvas `#f5f5f5`, ink `#0c0a09`, muted `#777169`, hairline `#e7e5e4`, primary `#292524`
- Icons: `lucide-react` (not inline SVGs)

## Server actions with Zod schemas

All server actions in `lib/actions/` validate input with Zod. When upgrading a schema (adding fields with `.default()`), `z.infer` produces the OUTPUT type where defaulted fields are required — callers must pass all fields explicitly. Update all call sites in pages when you change a schema.

## Events, queue, cache

- `lib/events/emitter.ts` — EventBus singleton (`global._eventBus`), survives HMR
- `lib/queue/index.ts` — priority job queue (`global._jobQueue`)
- `lib/cache/index.ts` — TTL cache (`global._cache`)
- `instrumentation.ts` registers event handlers on server startup (Node.js runtime only)

## Site chrome

`components/site-chrome.tsx` hides Navbar/Footer/Chatbot on `/dashboard`, `/admin`, `/support`, `/sign-in`, `/sign-up` routes. Marketing pages get the full chrome.
