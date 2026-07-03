<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Next.js 16 has breaking changes — middleware is now `proxy.ts`, APIs and conventions differ from training data. Read `node_modules/next/dist/docs/` before writing framework code.
<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16.2.10 · React 19 · Tailwind v4 · TypeScript 5 · Better Auth · MongoDB + Mongoose · Zod · AI SDK (OpenAI)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | **Only verification step** — typecheck runs inside `next build` |
| `npm run lint` | ESLint (next/core-web-vitals + typescript) |

No test runner. No standalone typecheck script. Always run `npm run build` to verify changes.

## Env

`.env.local` requires:
- `BETTER_AUTH_SECRET` — session signing secret
- `BETTER_AUTH_URL` — e.g. `http://localhost:3000`
- `MONGODB_URI` — e.g. `mongodb://localhost:27017/bpo`
- `OPENAI_API_KEY` — optional, for AI chat

MongoDB must be running locally for auth + app data.

## Project structure

```
app/                    — App Router at root (no src/)
  (app)/                — Route group: authenticated app shell (sidebar + topbar)
    dashboard/          — user role
    admin/              — admin role (role-gated in layout)
    support/            — support + admin roles
  api/                  — route handlers
  *.tsx                 — marketing site (home, about, services, etc.)
components/             — "use client" components
lib/
  actions/              — "use server" files (RPC boundary, safe to import from client)
  services/             — server-only (NO "use server" — never import from client)
  events/               — EventBus pub/sub + handlers
  queue/                — Priority job queue (global singleton)
  cache/                — TTL cache (global singleton)
  auth.ts               — Better Auth server config
  auth-client.ts        — Better Auth React client
  mongoose.ts           — Mongoose connection singleton
  mongodb.ts            — Native driver (Better Auth ONLY)
  utils/serialize.ts    — ObjectId → string conversion for RSC boundary
models/                 — Mongoose schemas (one file per collection)
proxy.ts                — Next.js 16 middleware (renamed from middleware.ts)
instrumentation.ts      — Registers event handlers on server startup
```

## Roles

Three roles via Better Auth admin plugin: `admin`, `user`, `support` (default: `user`).
Role-gating happens in `app/(app)/layout.tsx` (client-side redirect).

## Critical rules

### Mongoose must never reach the client bundle

Mongoose imports `async_hooks`/`child_process` which don't exist in browsers. Build fails.

- **`lib/actions/*.ts`** — have `"use server"` at top. Safe to import from client components.
- **`lib/services/*.ts`** — NO `"use server"`. These import Mongoose directly. **Never import from client components.**
- Client components that need service data must call API routes or server actions.

### Serialize Mongoose documents before returning

ObjectId is not serializable across the RSC boundary. Every server action / route handler must wrap results:

```ts
import { serialize, serializeArray } from "@/lib/utils/serialize";
return serialize(doc.toObject());
return serializeArray(docs.map(d => d.toObject()));
```

### Mongoose schema changes require dev server restart

Mongoose compiles schemas once at import time. HMR does NOT recompile them. If you change a model's enum/fields, you must restart `npm run dev` or you'll get validation errors from the stale cached schema.

### Aggregate pipelines don't auto-cast ObjectId

`.find()` auto-casts strings to ObjectId. `.aggregate()` does NOT. In aggregation `$match`, always wrap: `new mongoose.Types.ObjectId(session.user.id)`. A plain string will silently match nothing.

### Dual database access — don't mix

- **`lib/mongodb.ts`** (native MongoDB driver) — used ONLY by Better Auth (`lib/auth.ts`).
- **`lib/mongoose.ts`** (Mongoose) — used by ALL app code, models, and server actions.
- Both point at the same `MONGODB_URI`.

### User model coexists with Better Auth

`models/User.ts` uses `strict: false` and `collection: "user"` so Better Auth can write to the same collection. Don't change these.

### proxy.ts — public paths use prefix matching

`publicPaths.some(path => pathname === path || pathname.startsWith(path))`. Never add a broad prefix like `/api/chat` — it would expose all sub-routes. Add specific paths only (e.g. `/api/chat/guest`).

## Auth

- Better Auth with email/password + optional Google OAuth + admin plugin
- Session cookie: `better-auth.session`
- **Sign-in/up gotcha:** After `signIn()`/`signUp()`, use `window.location.href = "/dashboard"` (hard redirect) — `router.push()` causes a session race condition
- Auth route handler: `toNextJsHandler(auth)` — NOT `toNextJsHandler(auth.handler)`

## Tailwind v4

- `@import "tailwindcss"` in `app/globals.css` — no `@tailwind base/components/utilities`
- Theme defined via `@theme inline` in globals.css — no `tailwind.config`
- All colors use bracket notation (`bg-[#292524]`) — no named Tailwind colors except `text-white`
- Heading tags inherit `font-display` + `color: var(--color-ink)` from `@layer base`
- Cards use plain borders (`border border-hairline`), not `rounded-2xl`

## Design tokens

- **Display font:** EB Garamond (`font-display`), **Body:** Inter (`font-sans`)
- Key colors: canvas `#f5f5f5`, ink `#0c0a09`, muted `#777169`, hairline `#e7e5e4`, primary `#292524`
- Icons: `lucide-react`

## Server actions with Zod schemas

All server actions in `lib/actions/` validate input with Zod. When upgrading a schema (adding fields with `.default()`), `z.infer` produces the OUTPUT type where defaulted fields are required — callers must pass all fields explicitly. Update all call sites when you change a schema.

## Events, queue, cache

- `lib/events/emitter.ts` — EventBus singleton (`global._eventBus`), survives HMR
- `lib/queue/index.ts` — priority job queue (`global._jobQueue`)
- `lib/cache/index.ts` — TTL cache (`global._cache`)
- `instrumentation.ts` registers event handlers on server startup (Node.js runtime only)

## Key features

### Project submission workflow
- Users create/submit projects → admin reviews → approve/reject/request-revision
- Admin can add quoted cost + feedback
- Threaded discussion (comments) between client and admin
- Users can edit when status is `submitted`, `needs-revision`, or `rejected`
- Status flow: `submitted → under-review → approved → active → completed`

### Meeting calendar
- Google Calendar-style interface: month/week/day views
- Admin schedules with full form (type, recurring, agenda items, multi-participant)
- Color-coded by meeting type; click any slot to create; click meeting for details
- Users see their meetings in the same calendar (read-only)

### Real-time chat
- Guest chat (anonymous, tracked by clientId)
- Authenticated user ↔ admin chat
- Support inbox for support/admin roles
- SSE for all real-time delivery (notifications, chat streams)

### Requirements
- Users submit requirements → admin approves/rejects with notes
- History tracking with status transitions

## Site chrome

`components/site-chrome.tsx` hides Navbar/Footer/Chatbot on `/dashboard`, `/admin`, `/support`, `/sign-in`, `/sign-up` routes.
