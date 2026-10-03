# STACK.md — What We Build With

> Part of the spec triad: [PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) (what & why) · [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) (when) · **STACK.md** (with what).
> **Status: draft for review, 2026-10-02.** Clean rebuild — no code exists yet. Facts marked *(verified)* were checked against the vendor's own pages on that date; everything in §14 is still open.

## 1. Principles

- **One language, one repo.** TypeScript everywhere, strict. The streak engine and teaspoon math run unchanged on the device and on the server.
- **One app, three surfaces.** A single Expo codebase ships iOS, Android, and web. Parity is a property of the build, not something a gate has to police.
- **Buy what is not the product.** Identity, purchases, builds, and monitoring are managed services. We write the streak, the scanner, and the content.
- **One datastore.** Postgres holds data and the job queue. No Redis, no object storage.
- **Every choice here is swappable by ADR** (§11), not by drift.

## 2. Repo layout and tooling

```
apps/
  app/        Expo app — iOS, Android, web
  api/        Fastify API + Prisma schema + job workers
packages/
  core/       pure domain logic: streak, teaspoons, verdict, quota, sync merge
  content/    timeline, quiz, checklist, SOS copy as Zod-validated JSON
spec/         product · stories · plan · decisions
```

| Concern | Choice |
|---|---|
| Package manager | pnpm workspaces |
| Runtime (API, tooling) | Node.js, current LTS |
| Language | TypeScript, `strict` |
| Lint + format | Biome |
| Validation | Zod — API contracts, content, and LLM output share schemas from `packages/core` |
| Unit tests | Vitest (`core`, `content`, `api`) |
| App tests | jest-expo + React Native Testing Library |
| Device flows | Maestro |
| CI | GitHub Actions |

There is no `packages/ui` and no `packages/db`: with one app, components live in `apps/app`, and with one consumer, the Prisma schema lives in `apps/api`.

## 3. Auth — Clerk

- **App:** `@clerk/expo`. Web uses Clerk's prebuilt components from `@clerk/expo/web`; iOS and Android use its native components or custom flows built on its hooks *(verified: package renamed from `@clerk/clerk-expo` in v3, March 2026; native components are beta and need a development build, not Expo Go)*.
- **API:** `@clerk/fastify` — `clerkPlugin()` verifies the session token and `getAuth(request)` yields the user id *(verified)*. One `requireUser` hook wraps it; no route reads identity any other way.
- **One transport.** Every surface sends `Authorization: Bearer <Clerk session token>`. Our API sets no cookies, so it has no CSRF surface; cross-origin access is a CORS allowlist.
- **We store no credentials.** No passwords, no sessions, no reset tokens. Verification and reset emails are Clerk's, so we run no email provider.
- **Identity in our database** is a `users` row keyed by the Clerk user id, created on the first authenticated request. Every other table hangs off that id.
- **No anonymous accounts.** Clerk has no guest or anonymous user *(verified: open feature request, not shipped)*. Before sign-up, everything lives on the device; the first sync after sign-up uploads the local day log. Where sign-up sits in the funnel is a product decision — see §14.
- **Offline.** A signed-in app works with no network. No screen waits on a token; sync simply waits.
- **Deletion.** In-app account deletion calls our API, which deletes our rows and then the Clerk user. Clerk's signature-verified `user.deleted` webhook is the backstop.
- **Nothing sensitive goes to Clerk.** Quiz answers and craving data are never written to Clerk metadata.
- **Cost** *(verified, clerk.com/pricing)*: free to 50,000 monthly retained users per app; then $25/month plus $0.02 per retained user above that. A user counts only if they return at least a day after signing up.

## 4. Scanner pipeline

One route, two modes, no lookup path ([PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) §Core Thesis 1).

```
app: capture or pick photo → resize on device → POST /scan { mode, image(base64) }
api: requireUser → quota check → spend-ceiling check → vision call → Zod validate
     → verdict from packages/core → log tokens + cost → respond
```

- **Modes.** `label` transcribes the printed sugar figures from a nutrition label. `food` estimates sugar in unpackaged food, with a confidence. Different prompts and schemas, same route.
- **Driver seam.** The vision call sits behind one interface selected by config (`VISION_DRIVER`, `VISION_MODEL`). Changing model or provider is a config change plus the accuracy passes, not a code change.
- **Default driver: the Claude API** through `@anthropic-ai/sdk`, with the image sent as a base64 block inside the request and the result constrained by structured output from the same Zod schema the API validates against.
- **Never the Files API.** It would persist the photo on a third party. The bytes exist only inside one request to us and one request out.
- **Resize on the device** (`expo-image-manipulator`) before upload. An image costs `⌈w/28⌉ × ⌈h/28⌉` input tokens, so a 1000×1000 photo is 1,296 tokens *(verified, Claude vision docs)*. Resizing bounds both the bill and the upload.
- **Untrusted output.** A result that fails validation, reports low confidence, hits a token limit, or is refused becomes "couldn't read that — try again". Never a guess, never a 500.
- **Quota before spend.** A per-user daily scan quota (one quota across both modes, values in `packages/core`) and a global daily spend ceiling (`VISION_DAILY_CEILING_MICROS`) are both checked before any external call.
- **Metering.** Every call writes model, mode, token counts, and computed cost to one `scan_metrics` table. No image, no result payload.

**Model choice is open (§14).** Prices per million tokens *(verified, 2026-09-25 price list)* and a rough per-scan estimate, assuming a photo of about 1,500 image tokens, a 500-token prompt, and 300–800 output tokens:

| Model | Input / output | Rough cost per 1,000 scans |
|---|---|---|
| `claude-opus-5-5` (default until decided) | $4 / $20 | about $24 |
| `claude-sonnet-5-5` | $2 / $10 | about $12 |
| `claude-haiku-4-5` | $1 / $5 | about $3.50 |

The estimates are arithmetic, not measurements; `scan_metrics` replaces them with real numbers in the first week. Label photos may need more resolution than food photos: Opus 5.5 and Sonnet 5.5 accept up to 4,784 image tokens per photo, Haiku 4.5 caps at 1,568.

## 5. Data, sync, and jobs

- **Database:** managed Postgres.
- **ORM:** Prisma, server-side only. Schema and migrations live in `apps/api/prisma`. Migrations are forward-only and applied by the deploy, never by hand.
- **Access rule:** every user-scoped query goes through repository helpers that require a `userId`. No route touches the Prisma client directly.
- **The day log** is the durable record: append-only rows keyed `(userId, localDate, kind, detail)`. Streak, best streak, lifetime totals, and freeze balance are derived on read by `packages/core`, never stored.
- **Sync:** `GET /day-log` and `POST /day-log`. The server merges with the same `mergeDayLog` function the app uses, so two devices converge by construction.
- **Jobs:** pg-boss on the same Postgres, in its own schema, run by a worker inside the API process. It owns push scheduling and the cohort fan-out. It needs a direct, non-pooled connection.

## 6. Client app — Expo

- **Framework:** Expo with Expo Router; web through React Native Web. Current SDK is 57 (React Native 0.86, React 19) *(verified, Expo docs)* — pin to the newest SDK that `@clerk/expo` supports (§14).
- **Development builds from day one.** Clerk's native components and in-app purchases do not run in Expo Go.
- **Local store.** One `DayLogStore` interface in `packages/core` with two adapters: `expo-sqlite` on iOS and Android, IndexedDB on web. `expo-sqlite`'s web build is alpha and needs cross-origin isolation headers *(verified)*, which can break third-party sign-in and checkout embeds, so web does not use it. One conformance suite in `packages/core` runs against every adapter.
- **Styling:** React Native `StyleSheet` plus one design-token module. No Tailwind layer: it adds build configuration and a version-compatibility risk for no feature the product needs.
- **State:** Zustand for UI state; a thin typed API client built from the shared Zod schemas. No query-cache library until a screen needs one.
- **Camera and photos:** `expo-camera` for capture on mobile, `expo-image-picker` for upload on web and gallery picks.
- **Share card:** `react-native-view-shot` and `expo-sharing` on mobile; canvas with `navigator.share` or download on web.
- **Secrets:** Clerk's token cache uses `expo-secure-store`. No API key of any provider ships in the app bundle.

## 7. Privacy and data handling

- **Scan photos are never written** — not to storage, disk, a column, or a log line. There is no object storage in this stack at all. Proven by route tests and by repo-wide greps that fail CI if a storage client, a filesystem write in `apps/api/src`, or a `Bytes` column appears.
- **Request logging** in the API redacts bodies on `/scan`.
- **Craving logs and quiz answers** live only in user-scoped rows and the local store. They never appear in analytics events, error reports, or Clerk metadata.
- **Third parties and what each receives:** Clerk — email and credentials. The vision provider — one photo per scan, in-request. The payments provider — purchase records. Analytics — named events with no sensitive fields.

## 8. Payments — recommended, not yet decided

- **On iOS and Android there is little to choose.** Apple and Google require their own in-app purchase systems for digital subscriptions sold inside the app. The decision is only what sits on top of them.
- **Recommendation: RevenueCat** (`react-native-purchases`). It wraps both stores behind one SDK, holds the subscription state, and tells our API who is entitled through a signature-verified webhook. The API stores an `entitlement` per user; the app never decides entitlement on its own.
- **Web checkout depends on where the business is registered.** RevenueCat's web product runs on Stripe or Paddle *(verified)*. Stripe is invite-only in India and RevenueCat's own web billing does not yet work with Indian Stripe accounts; Paddle has no such limit *(verified, RevenueCat community)*. See §14.
- **Identity:** the RevenueCat app user id is the Clerk user id, so one purchase follows the user across all three surfaces.

## 9. Notifications

- `expo-notifications` with the Expo push service; device tokens registered with the API.
- Scheduling is server-side in pg-boss, in the user's local time.
- Web push is post-MVP; web shows the same state in-app.

## 10. Analytics and monitoring

- **Product analytics:** PostHog. Event names live in one registry module; no ad-hoc strings.
- **Errors:** Sentry in the app and the API, with request bodies and breadcrumbs scrubbed per §7.
- **Uptime:** one external check on `GET /health`.

## 11. Decisions

A change to anything in this file is an ADR in `spec/decisions/`, in the same change that makes it: what was chosen, what was rejected, and why. Per-story learnings live beside them.

## 12. Quality gates

Every merge to `main` passes, in CI:

1. `biome check`
2. `tsc --noEmit` across the workspace
3. Vitest for `core`, `content`, `api` — `packages/core` covers every streak transition, teaspoon rounding, verdict threshold, and quota edge
4. jest-expo for `apps/app`
5. Content validation — invalid JSON fails the build
6. The no-persistence greps from §7
7. A production build of the API and a web export of the app

No live LLM, Clerk, or store calls in CI: recorded fixtures, including malformed and adversarial model output.

## 13. Hosting and deploy

| Piece | Default | Requirement that drives it |
|---|---|---|
| API + job worker | One always-on container (Railway) | pg-boss needs a long-lived process |
| Postgres | Managed, with point-in-time recovery (Neon) | Subscription data must be restorable |
| Web app | Static export on Cloudflare Pages | No server rendering needed |
| iOS and Android | EAS Build, Submit, and Update | Over-the-air fixes during the January spike |
| Domains | `app.<domain>` and `api.<domain>` | Clerk production needs a custom domain |

The three named hosts are defaults, not verified against region or price. They are confirmed at scaffold time (§14).

## 14. Open decisions and things to verify

**Decisions for the product owner**

1. **Payments.** Accept RevenueCat for the stores? And which country is the business registered in, which decides Stripe or Paddle for web?
2. **Vision model.** Opus 5.5, Sonnet 5.5, or Haiku 4.5 at launch. The label and food accuracy passes should decide; cost per scan differs about sevenfold.
3. **Where sign-up sits.** Clerk has no anonymous accounts, so the old "anonymous first, upgrade later" flow is gone. Proposed: quiz and plan run with no account, and sign-up happens at the paywall, before purchase.

**Verify at scaffold time**

- The newest Expo SDK that `@clerk/expo` and `react-native-purchases` both support. Clerk's published compatibility note covers SDK 54 and 55, not 57.
- `@clerk/fastify` accepting the Bearer token from the native app.
- PostHog's Expo SDK on web.
- Host regions and pricing for §13, against where the first users are.
