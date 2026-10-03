# STACK.md — What We Build With

> Part of the spec triad: [PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) (what & why) · [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) (when) · **STACK.md** (with what).
> **Status: decisions confirmed by the product owner 2026-10-03; awaiting a final read-through.** Clean rebuild — no code exists yet. Facts marked *(verified)* were checked against the vendor's own pages on 2026-10-02 or 2026-10-03. §14 lists what is still open.

## 1. Principles

- **One language, one repo.** TypeScript everywhere, strict. The streak engine and teaspoon math run unchanged on the device and on the server.
- **One app, three surfaces.** A single Expo codebase ships iOS, Android, and web. Parity is a property of the build, not something a gate has to police.
- **Buy what is not the product.** Identity, purchases, builds, and monitoring are managed services. We write the streak, the scanner, and the content.
- **One datastore.** Postgres holds data and the job queue. No Redis, no object storage.
- **Stable releases only.** Nothing alpha, beta, preview, or experimental ships in this product (§2, Dependency policy).
- **Every choice here is swappable by ADR** (§11), not by drift.

## 2. Repo layout and tooling

```
apps/
  app/        Expo app — iOS, Android, web
  api/        Fastify API + Prisma schema + job workers
packages/
  core/       pure domain logic: streak, teaspoons, verdict, quota, sync merge
  content/    timeline, quiz, checklist, SOS copy as Zod-validated JSON
spec/         product · stories · modules · plan · decisions
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

### Dependency policy — stable only

- **A dependency ships only at a stable, generally available release.** No alpha, beta, release-candidate, canary, or preview versions of any library, SDK, or package, and no feature a vendor labels beta or experimental inside an otherwise stable package.
- **Versions are the latest stable at scaffold time, pinned by the lockfile.** Nothing floats. The exact version of every dependency, with its evidence, is in [`spec/decisions/01-foundation/01-version-pins.md`](../decisions/01-foundation/01-version-pins.md); installs name the version from that file, because a registry's `latest` tag can point to a pre-release.
- **The Expo SDK is the newest one every native dependency officially supports** — Clerk, RevenueCat, and Sentry — even when that is not the newest SDK Expo has released.
- **Upgrades are deliberate changes**, each its own commit with CI green. No upgrades between store submission and the end of January except security fixes.
- **Adding a dependency needs a reason the platform cannot meet.** Fewer packages is the cheapest form of stability.

What this rules out today, and what is used instead:

| Not stable | Status *(verified)* | Used instead |
|---|---|---|
| Clerk's native UI components for Expo | Beta | Custom sign-in screens on Clerk's stable hooks |
| `expo-sqlite` on web | Alpha | IndexedDB on web; `expo-sqlite` on iOS and Android only |
| Gemini's OpenAI-compatible endpoint | Beta: "support for the OpenAI libraries is still in beta" | **The one exception** — allowed before launch only; launch runs on OpenAI's own API through the same stable SDK (§4) |
| Pre-release Expo SDKs and compiler previews | Canary or beta | Latest stable release |

## 3. Auth — Clerk

- **App:** `@clerk/expo`. Web uses Clerk's prebuilt components from `@clerk/expo/web`; iOS and Android use our own sign-in screens built on Clerk's hooks. Clerk's native UI components are beta and therefore out under the dependency policy *(verified: package renamed from `@clerk/clerk-expo` in v3, March 2026; native components shipped as beta in v3.1)*.
- **API:** `@clerk/fastify` — `clerkPlugin()` verifies the session token and `getAuth(request)` yields the user id *(verified)*. One `requireUser` hook wraps it; no route reads identity any other way.
- **One transport.** Every surface sends `Authorization: Bearer <Clerk session token>`. Our API sets no cookies, so it has no CSRF surface; cross-origin access is a CORS allowlist.
- **We store no credentials.** No passwords, no sessions, no reset tokens. Verification and reset emails are Clerk's, so we run no email provider.
- **Identity in our database** is a `users` row keyed by the Clerk user id, created on the first authenticated request. Every other table hangs off that id.
- **No anonymous accounts.** Clerk has no guest or anonymous user *(verified: open feature request, not shipped)*. Before sign-up, everything lives on the device; the first sync after sign-up uploads the local day log. Sign-up sits at the paywall: the quiz and plan run with no account, and the account is created just before purchase (decided 2026-10-03).
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
- **Driver seam.** The vision call sits behind one interface selected by config (`VISION_BASE_URL`, `VISION_MODEL`, `VISION_API_KEY`). Changing model or provider is a config change plus the accuracy passes, not a code change.
- **One driver: the official `openai` SDK, on the Chat Completions API.** Google serves Gemini through an OpenAI-compatible endpoint, so the same client, the same request, and the same Zod schema (`zodResponseFormat` with `chat.completions.parse`, both stable in the SDK *(verified)*) work against Gemini now and OpenAI later. Chat Completions is used because it is the API both providers serve. The image goes as a base64 data URL inside the request, and the parsed result is still checked by our own Zod schema before it is trusted.
- **Never a provider file-upload API.** It would persist the photo on a third party. The bytes exist only inside one request to us and one request out.
- **Resize on the device** (`expo-image-manipulator`) before upload. Resizing bounds the upload and, on token-priced models, the bill.
- **Untrusted output.** A result that fails validation, reports low confidence, hits a token limit, or is refused becomes "couldn't read that — try again". Never a guess, never a 500.
- **Quota before spend.** A per-user daily scan quota (one quota across both modes, values in `packages/core`) and a global daily spend ceiling (`VISION_DAILY_CEILING_MICROS`) are both checked before any external call.
- **Metering.** Every call writes model, mode, token counts, and computed cost to one `scan_metrics` table. No image, no result payload.

**Now, for building and testing: Gemini on its free tier.** Decided 2026-10-03.

- `VISION_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/` and `VISION_MODEL=gemini-3.8-flash`, a generally available model with a free tier *(verified, Gemini pricing page)*.
- **Limits are not published.** Google shows free-tier rate limits per project in AI Studio and does not guarantee them *(verified)*. Read them off the project before planning an accuracy pass.
- **Test photos only.** On the free tier Google uses submitted content to improve its products *(verified)*. No real user's photo goes through it.
- **A recorded exception to the dependency policy.** Google labels its OpenAI-library support beta. It is accepted because it is used only before launch and the package we ship, `openai`, is stable.

**At launch: an OpenAI vision model, paid.** Which one is decided later. Before the Phase 5 launch gate:

1. Change the three config values. No code changes.
2. Choose the model by running both accuracy passes on the OpenAI candidates. Results on Gemini do not carry over.
3. Confirm OpenAI's retention terms for API inputs against §7 before any real photo flows.
4. Set `VISION_DAILY_CEILING_MICROS` from its real price, using `scan_metrics` token counts.

## 5. Data, sync, and jobs

- **Database:** Postgres hosted by Supabase in Mumbai, reached only through its connection URL in `DATABASE_URL` (decided 2026-10-03). Supabase is the database host and nothing more: no `@supabase/*` package, no Supabase Auth, Storage, Realtime, or client anywhere in the repo. The URL must be a non-pooled connection, which Prisma migrations and pg-boss both need.
- **ORM:** Prisma, server-side only. Schema and migrations live in `apps/api/prisma`. Migrations are forward-only and applied by the deploy, never by hand.
- **Access rule:** every user-scoped query goes through repository helpers that require a `userId`. No route touches the Prisma client directly.
- **The day log** is the durable record: append-only rows keyed `(userId, localDate, kind, detail)`. Streak, best streak, lifetime totals, and freeze balance are derived on read by `packages/core`, never stored.
- **Sync:** `GET /day-log` and `POST /day-log`. The server merges with the same `mergeDayLog` function the app uses, so two devices converge by construction.
- **Jobs:** pg-boss on the same Postgres, in its own schema, run by a worker inside the API process. It owns push scheduling and the cohort fan-out. It needs a direct, non-pooled connection.

## 6. Client app — Expo

- **App name:** Unspoon.
- **Framework:** Expo with Expo Router; web through React Native Web. Pinned to Expo SDK 57 (React Native 0.86.3, React 19.2.3), the newest stable SDK, which Clerk, RevenueCat, and Sentry all support *(verified 2026-10-03, [version pins](../decisions/01-foundation/01-version-pins.md))*.
- **Development builds from day one.** In-app purchases do not run in Expo Go.
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
- **Third parties and what each receives:** Clerk — email and credentials. The vision provider — one photo per scan, in-request; at launch it must be a provider that does not train on or retain inputs (§4). RevenueCat, the stores, and Paddle — purchase records. Analytics — named events with no sensitive fields.

## 8. Payments — RevenueCat and Paddle

Confirmed 2026-10-03. The business is registered in India and sells globally, which fixes most of this section.

- **iOS and Android: the stores' own billing, through RevenueCat** (`react-native-purchases`). Apple and Google require their in-app purchase systems for digital subscriptions sold inside the app; RevenueCat wraps both behind one SDK and holds the subscription state.
- **Web: Paddle, connected to RevenueCat.** Paddle is a merchant of record: it is the seller on the customer's receipt and it collects and remits sales tax and VAT in each country, which matters for an Indian company selling worldwide. It accepts sellers based in India *(verified: India is not on Paddle's unsupported-seller list)*.
- **Why not Stripe on web.** Stripe is invite-only in India, and RevenueCat's own web billing does not yet work with Indian Stripe accounts *(verified, RevenueCat community)*. That also rules out the web support built into `react-native-purchases`, which runs on that Stripe path.
- **Web checkout is hosted, not embedded.** The web app sends the signed-in user to a RevenueCat Web Purchase Link backed by Paddle's hosted checkout *(verified: a supported path in RevenueCat's Paddle integration)*. No payment form or payment SDK lives in our web bundle.
- **One entitlement, one source.** RevenueCat tells our API who is subscribed through a signature-verified webhook, whichever store or checkout took the money. The API stores an `entitlement` per user; the app never decides entitlement on its own.
- **Identity:** the RevenueCat app user id is the Clerk user id, so one purchase follows the user across all three surfaces.
- **One purchase module, two platform files:** `purchases.native.ts` for the stores, `purchases.web.ts` for the hosted link.

## 9. Notifications

- `expo-notifications` with the Expo push service; device tokens registered with the API.
- Scheduling is server-side in pg-boss, in the user's local time.
- Web push is post-MVP; web shows the same state in-app.

## 10. Analytics and monitoring

- **Product analytics:** PostHog. Event names live in one registry module; no ad-hoc strings.
- **Errors:** Sentry in the app and the API, with request bodies and breadcrumbs scrubbed per §7.
- **Uptime:** one external check on `GET /health`.

## 11. Decisions

A change to anything in this file is recorded in `spec/decisions/`, in the decisions file of the module that makes it (`spec/decisions/NN-<story>/MM-<module>.md`), and this file is updated in the same change: what was chosen, what was rejected, and why. The module's other decisions and learnings live in that same file. The full workflow is in [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) §Spec Workflow, Commits & Versioning.

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
| API + job worker | One always-on container; host chosen in the deploy module | pg-boss needs a long-lived process, and the API must run in or beside Mumbai, next to its database |
| Postgres | Supabase, Mumbai — connection URL only (§5) | Subscription data must be restorable: backups are confirmed on the chosen plan before launch |
| Web app | Static export on Cloudflare Pages | No server rendering needed |
| iOS and Android | EAS Build, Submit, and Update | Over-the-air fixes during the January spike |
| Domains | `app.<domain>` and `api.<domain>` | Clerk production needs a custom domain |

The region is Mumbai for now (decided 2026-10-03); users are global, so it is revisited once real traffic shows where they are. The API host and the static web host are still open and are settled in the deploy module (§14).

## 14. Open decisions and things to verify

**Decided 2026-10-03:** payments (§8), sign-up at the paywall (§3), and Gemini now with OpenAI at launch (§4).

**Still open**

1. **Which OpenAI model at launch.** Deferred by the product owner; settled by the two accuracy passes, before the Phase 5 launch gate (§4).

**Verify at scaffold time**

- ~~The newest Expo SDK that Clerk, RevenueCat, and Sentry all support~~ — resolved: SDK 57 ([version pins](../decisions/01-foundation/01-version-pins.md) §1).
- ~~That every package in §2–§10 is at a stable release~~ — resolved: pinned with evidence in the same file.
- Whether Clerk's native UI components are still beta at `@clerk/expo` 4.x, before Phase 2.
- `@clerk/fastify` accepting the Bearer token from the native app.
- RevenueCat Web Purchase Links with Paddle hosted checkout, end to end in sandbox, for an India-registered Paddle account.
- `chat.completions.parse` with an image and a Zod schema against the Gemini endpoint. Google's own example still uses the SDK's older `beta.` path.
- The Gemini free-tier limits shown in AI Studio for the project.
- PostHog's Expo SDK on web.
- An API host with a Mumbai region, and a static web host, for §13.
- Supabase's non-pooled connection string working from the chosen API host, and its backup and recovery terms on the chosen plan.

**Approvals with lead time — owned by the product owner**

- Paddle seller onboarding, Apple Developer enrolment, and Google Play developer verification each involve a review we do not control. They are started this month, not in December.
