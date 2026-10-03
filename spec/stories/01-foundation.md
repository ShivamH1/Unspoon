# Story 01 — Foundation

> **Roadmap:** [Phase 0 — Foundation](../product/PRODUCT_ROADMAP.md), tasks T1–T6.
> **Status:** Approved 2026-10-03. Modules: [`spec/modules/01-foundation/`](../modules/01-foundation/).
> **Read first:** [PRODUCT_CONTEXT.md](../product/PRODUCT_CONTEXT.md) · [PRODUCT_ROADMAP.md](../product/PRODUCT_ROADMAP.md) · [STACK.md](../product/STACK.md).

## Outcome

Anyone, human or agent, can clone the repo, install once, and run the app on iOS, Android, and web; an API and a database are deployed; and every pull request is gated by CI. No product feature exists yet. Every later story builds on this without touching the toolchain again.

## Why this comes first

The schedule has no slack ([PRODUCT_ROADMAP.md](../product/PRODUCT_ROADMAP.md) §Status). The riskiest unknowns in the stack are compatibility questions — which Expo SDK Clerk, RevenueCat, and Sentry all support, and whether pnpm, Expo, and the shared packages work together on three surfaces. They are cheapest to answer now, before any feature depends on the answer.

## What this story delivers

1. **A workspace.** pnpm workspace, strict TypeScript, Biome, and a README that lists every command a developer needs.
2. **Pinned, stable versions.** The Expo SDK and every dependency chosen under the dependency policy ([STACK.md](../product/STACK.md) §2), with the choice and its evidence recorded.
3. **Two shared packages.** `packages/core` and `packages/content`, each with real, tested code — small, but proving the wiring.
4. **An API.** Fastify with `GET /health`, Prisma, a `users` table, and a first migration.
5. **An app.** An Expo app that boots as an iOS development build, an Android development build, and a web export, and that uses both shared packages.
6. **CI and deploy.** Every gate in [STACK.md](../product/STACK.md) §12 on every pull request; the API and the web export deployed.

## Acceptance criteria

Each traces to a Phase 0 exit criterion in the roadmap.

- **S01-AC1 — Clean clone works.** On a machine with only Node and pnpm, `pnpm install` followed by the documented commands runs the tests, the API, and the web app with no undocumented step.
- **S01-AC2 — Three surfaces boot.** The app opens on an iOS device or simulator, an Android device or emulator, and in a browser.
- **S01-AC3 — Shared code is really shared.** One screen shows a value computed by `packages/core` and a string read from `packages/content`, identical on all three surfaces. The API imports `packages/core` too.
- **S01-AC4 — CI gates every pull request.** All seven gates in [STACK.md](../product/STACK.md) §12 run and pass on a pull request.
- **S01-AC5 — The gates can fail.** Each gate has been seen to go red for the right reason at least once: a lint error, a type error, a failing test, an invalid content file, and a planted violation of the no-persistence greps.
- **S01-AC6 — The API is deployed.** `GET /health` answers at the deployed URL and reports that the database is reachable.
- **S01-AC7 — Migrations are applied by the deploy.** The first migration reached the managed database through the deploy flow, not by hand, and running the deploy again changes nothing.
- **S01-AC8 — The web app is deployed.** The web export is served from its static host.
- **S01-AC9 — Versions are recorded and stable.** A decisions file lists every pinned dependency with its version and the evidence that it is a stable release and compatible with the chosen Expo SDK. It lists no alpha, beta, release-candidate, canary, or preview version.
- **S01-AC10 — No secret in the repo or the app bundle.** Secrets live in the hosts' and CI's secret stores; an example env file documents every variable.

## Out of scope

- Sign-in, Clerk, or any account concept beyond the empty `users` table.
- Any product screen: streak, quiz, paywall, scanner. The single screen here is a wiring check and is replaced in Story 02.
- The local day-log store and its adapters (Phase 1).
- RevenueCat, Paddle, the vision driver, pg-boss, push notifications, PostHog, and Sentry. Their versions are checked for compatibility here; none is installed or integrated until the phase that uses it.
- Production domains and store listings (Phase 5).

## Settled by the product owner (2026-10-03)

- **Repository:** `github.com/ShivamH1/Unspoon`, with `main`, `development`, and one branch per module.
- **Database:** Supabase Postgres, used through its connection URL only.
- **App name:** Unspoon.
- **Region:** Mumbai, for now.

## Still needed from the product owner

1. **The Supabase database URL** (module 05). It goes in a local `.env` and later in the hosts' secret stores. It is never committed and never pasted into a chat.
2. **An Expo account** for EAS builds (module 06).
3. **The iOS bundle identifier and Android package name**, for example `com.<company>.unspoon` (module 06). These are painful to change after store submission.
4. **Accounts on the API host and the static web host**, once the deploy module has chosen them (module 07).

## Risks

- **No Expo SDK satisfies every native dependency at a stable release.** Then the story stops and the conflict goes to the product owner, since it changes [STACK.md](../product/STACK.md).
- **iOS device builds need an Apple Developer account.** Simulator builds do not, so AC2 can pass on a simulator while enrolment is in progress.
- **pnpm with Expo in a monorepo** needs Metro configured to resolve workspace packages. This is the most likely place for the wiring to fail and is why AC3 exists.
