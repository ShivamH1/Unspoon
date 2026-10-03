# PRODUCT_ROADMAP.md — Development Phases

> Part of the spec triad: [PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) (what & why) · **PRODUCT_ROADMAP.md** (when) · [STACK.md](./STACK.md) (with what).
> **Timing constraint:** the January demand spike is the business ([PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) §Core Thesis). Phases 0–6 must complete before mid-December; the cohort challenge (Phase 7) goes live for January 1. Slipping past January means waiting a year — scope gets cut before dates do.

> **Clean rebuild declared 2026-10-02 — nothing below is built in this repo.** `Unspoon` starts from zero code on the stack in [STACK.md](./STACK.md). Everything below was written against the previous repo and its stack: every Status entry, every "Done", and every reference to `apps/demo`, `apps/web`, `apps/mobile`, hand-built auth, Bun, or barcode code (including the removal task P4.T9) describes that repo, not this one. This file is owed a rewrite once STACK.md is approved. Until then, read it for the feature sequence and the exit criteria only.

## Rules for agents

- **One phase at a time.** Build only the active phase. Features from later phases are out of scope even if adjacent code is open — no pulling work forward.
- **Exit criteria gate the phase.** A phase is complete when every exit criterion passes, not when code merges. The next phase does not start early.
- **Scope changes edit this file.** Adding, cutting, or moving a feature means updating this roadmap in the same PR, so the spec never lies.
- **Status is kept current.** Update the status column when a phase starts or ends. This file is the single source of truth for "where are we."
- Estimates are working budgets, not deadlines — except the January gate above, which is a deadline. Blowing an estimate triggers a scope conversation, not silent overtime.
- **Phases break into tasks, tasks into steps, and every step lands as its own commit** — see "Stories, Plans, Commits & Versioning" below.
- **Demo-first, then both surfaces together.** Phase 1 ships a sales demo on web before any product engineering. From Phase 2 onward, every user-facing feature lands on **web and mobile in the same phase** — no platform drifts ahead of the other. Photo *capture* stays mobile-camera-first; web reaches the same scan pipeline via photo file upload.

## Stories, Plans, Commits & Versioning

**Story → plan workflow** (spec directories: `product/` · `stories/` · `plan/` · `decisions/`)
- The tasks below are the **phase-level breakdown**. Before implementation, each phase (or a slice of it) gets a **story file** in `spec/stories/NN-<name>.md` (e.g. `00-sales-demo.md`) — authored by the product owner, listing the tasks to perform.
- For each shared story file, the agent writes a matching **plan** in `spec/plan/NN-<name>.md`: implementation approach — ordered tasks and steps, files touched, risks, and verification checks, referencing the triad. **Implementation starts only after the plan is agreed.**
- Decisions and learnings from executing a story are recorded in `spec/decisions/` (ADRs live here — see [STACK.md](./STACK.md) §11).
- The agreed plan is the source of `T`/`S` numbering for commits. Steps are checked off in the plan file **in the same commit** that completes them — the plan and reality never diverge.

**Commit rules**
- **One step = one commit, pushed to GitHub.** No batching multiple steps into one commit; no half-steps. If a step turns out too big for one commit, split the step in the plan file first (docs commit), then implement.
- **Every doc/spec update is its own commit** (`docs:` type). Never mix spec changes and code changes in one commit — exception: checking off a step's checkbox rides with that step's commit.
- Format: **Conventional Commits** with task reference:
  `<type>(<scope>): P<phase>.T<task>.S<step> <summary>`
  e.g. `feat(core): P2.T4.S3 streak survives timezone change`
  Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`. Scope = workspace package (`core`, `db`, `api`, `mobile`, `web`, `ui`, `content`) or `spec` for spec-folder edits.
- Every commit must leave CI green (`bun test` + Biome + `tsc` + build), with the single exception in §Rollback below: a TDD step may commit a failing test alone when the next commit makes it pass. No "WIP" commits on main history.
- Commit body states what changed and why when the summary isn't enough; never empty for non-trivial steps.

**Rollback — the point of all this granularity**
- **Every commit is a rollback point, and every *merge* to `main` is green.** The repo must build and run at every commit; `bunx biome check .`, `bun run typecheck`, and the build pass at every commit without exception — that is why steps are small and never batched.
- **The one permitted red is a failing test committed on purpose.** A TDD "write the failing test" step commits its test alone, and the very next commit makes it pass. That pair is the smallest honest unit of work — batching them hides whether the test could ever fail. Nothing else may be red: a commit whose *code* only works combined with the next one is still a broken rollback point and a rule violation, and no step may leave a failing test unaddressed for more than one commit.
- A step that spans code + schema + content must land them **in one commit in a compatible state** — never a migration in one commit and the code that needs it in the next.
- DB migrations are forward-only files, but each migration commit must keep the previous app version working against the new schema (additive first; destructive column drops come one phase after the code stops using them). Rolling back app code must never require rolling back the database.
- Rollback = `git revert` (or redeploy an earlier tag) — never `git reset`/force-push on `main`. History is append-only; a bad step is undone by a new revert commit referencing the same `P.T.S` id.
- Phase tags (`v0.N.0`) are the coarse rollback anchors: any tagged version must be independently deployable/buildable at any time.

**Versioning**
- SemVer, pre-1.0: **phase completion bumps minor** — finishing Phase N tags `v0.N.0` (e.g. Phase 1 done = `v0.1.0`). Fixes after a phase tag bump patch (`v0.1.1`).
- Tag is created only when the phase's exit criteria pass, in the same commit that flips the phase's Status to Done.
- `v1.0.0` = Phase 6 launch build: web app live in production + apps live on the stores, before the January window.
- **Phase 3 was withdrawn** (see below), so no `v0.3.0` is ever tagged — the sequence runs `v0.2.0` → `v0.4.0`. Phases are not renumbered: `P3.T…` commit ids already in history keep meaning what they meant.

## Status

| Phase | Name | Estimate | Status |
|---|---|---|---|
| 0 | Foundation | 2–3 days | Done |
| 1 | Sales demo (web) | 1 week | Awaiting deploy |
| 2 | Streak + quiz + paywall (web + mobile) | 2 weeks | In progress — T0–T7 done, T4/T5 having landed the app-shell lift T6 owed (minus the Scan tab and deleting `apps/demo`, both Phase 3); T8 next |
| 3 | Barcode scanner | — | Withdrawn 2026-10-02 — barcode scanning is out of the product; T1–T5 were built, their removal is owed at P4.T9; never tagged |
| 4 | Scanner: label read + food estimate + teaspoon verdict (web + mobile) | 1–2 weeks, plus T9–T10 (not yet estimated) | In progress — T1–T8 built and reviewed; T9 (barcode removal) and T10 (label scan) not started; T8 share artefact needs re-scoping; exit criteria pending the device walk and the accuracy passes |
| 5 | Body timeline + craving SOS (web + mobile) | 1 week | Not started |
| 6 | Launch (web production + stores, pre-January) | ongoing | Not started |
| 7 | January cohort challenge (web + mobile) | 1–2 weeks | Not started |
| 8 | Post-MVP | — | Not started |

**Phase 1 is code-complete and not yet Done.** Every exit criterion below passes locally and in CI; the first — a public URL — waits on the one-time Cloudflare Pages setup, which is manual and outside the repo. The workflow that performs the deploy is committed (`.github/workflows/deploy.yml`) and runs the moment the two Actions secrets exist; the procedure is [apps/demo/README.md](../../apps/demo/README.md). The row flips to `Done` and tags `v0.1.0` when the deployed URL walks the golden path, not before.

---

## Phase 0 — Foundation

Monorepo scaffold per [STACK.md](./STACK.md). Everything after this phase assumes a working toolchain on all three apps.

**Tasks**
- **T1 — Repo + workspaces.** Git repo, Bun workspaces root `package.json`, `tsconfig.base.json` (strict), Biome config, `.gitignore`, README stub.
- **T2 — Package scaffolds.** `packages/core` (domain lib + tests), `packages/ui` (shadcn/ui init + Tailwind v4 theme), `packages/content` (Zod schemas + validated JSON).
- **T3 — Web app scaffold.** The Vite + React 19 boot with Tailwind wired, rendering a `packages/ui` component. Built as `apps/web`; renamed to `apps/demo` in Phase 1 T16 so the real web app could be built beside the demo rather than on top of it.
- **T4 — CI.** GitHub Actions: `bun install → biome check → bun test → tsc --noEmit → build` on every PR.

**Exit criteria**
- `bun install && bunx biome check . && bun test && bun run typecheck` green in CI on a PR.
- Web app renders at `localhost` with a `packages/ui` component.

`apps/api`, `apps/mobile`, `packages/db`, and the Supabase project moved to Phase 2 T0 — the Phase 1 demo has no backend, so scaffolding one here would have been a week of setup nothing exercised. See `spec/decisions/00-sales-demo.md` ADR-1.

## Phase 1 — Sales demo (web)

A deployed, clickable web demo of the product's golden path — used to sell, validate, and align on UX before product engineering. **Demo rules:** no real auth, no real DB, no billing, **no vision-LLM calls** — seeded in-memory state and pre-scored fake products only, one-click reset, zero real credentials or keys anywhere in the build. Demo code lives in `apps/demo`; screens built here are lifted into `apps/web` in later phases, demo *data* is thrown away.

**Tasks**
- **T1 — Golden-path script.** Write the demo storyline as a doc in `spec/decisions/`: quiz → personalized plan → paywall pitch → streak screen with day-4 timeline story → scan a product → 10-teaspoon shock verdict → craving SOS. This script is the demo's spec.
- **T2 — Demo state.** Seeded in-memory store (Zustand) with streak day, checklist, and a catalog of ~15 pre-scored fake products (barcode + name + sugar facts — no OpenFoodFacts, no LLM); deterministic transitions; "Reset demo" control.
- **T3 — Core screens.** Quiz funnel, plan + paywall-pitch screen, streak + body-timeline screen, daily checklist, craving SOS — all shadcn/Tailwind from `packages/ui`, desktop + mobile-web responsive.
- **T4 — Scan + verdict screens.** Fake scan flow (pick a product or type a barcode from the demo catalog) ending in the verdict screen: teaspoon visualization first, traffic light, grams second — the shareable shock moment, reused as the real verdict UI later.
- **T5 — Deploy.** Static hosting (Cloudflare Pages, [STACK.md](./STACK.md) §13) on a shareable URL.

> **Two demo screens reach into later phases and are mock-ups, not phase delivery.** The photo-scan tab renders seeded plate estimates with no camera, no upload, and no vision call — the real pipeline is Phase 4. The January cohort screen renders authored figures from `packages/content` with no backend — the real cohort is Phase 7. Neither is licence to build the later phase early; both exist because a sales artefact that omits January undersells, and because "what about food without a barcode" is the first question every viewer asks.

> **Owed before deploy — barcode is no longer in the product (2026-10-02, see Phase 3).** The demo's scan flow still offers "type a barcode": T2's catalog keys products by barcode and T4's flow accepts one. A sales demo must not show a feature we will not ship, so the barcode entry goes and picking a catalog product is presented as a label scan. The catalog's sugar facts and the verdict screen are unchanged.

**Exit criteria**
- Public URL walks the full golden path in under 3 minutes with zero backend dependencies.
- Demo is resettable to initial state in one click; works on desktop and phone browser.
- Zero real credentials, keys, or user data anywhere in the demo build; zero paid vision-LLM or OpenFoodFacts calls — every verdict comes from the pre-scored catalog.

## Phase 2 — Streak + quiz + paywall (web + mobile)

The revenue spine, on both surfaces. Own auth per [STACK.md](./STACK.md) §3; streak engine in `packages/core`; quiz funnel → personalized plan → RevenueCat hard paywall, one global price.

**Tasks**
- **T0 — Deferred Phase 0 scaffolds. — Done.** `apps/api` (Fastify 5 + `GET /health`), `apps/mobile` (Expo SDK 57 boot, confirmed on a device), `apps/web` (Vite 8 + React 19 shell beside `apps/demo`), `packages/db` (Prisma 7), the Supabase project, `schema.prisma` with `users`, and the first migration applied through the migration flow. Deferred here from Phase 0 because the Phase 1 demo uses no backend — see `spec/decisions/00-sales-demo.md` ADR-1. Story [01-project-setup.md](../stories/01-project-setup.md), plan [01-project-setup.md](../plan/01-project-setup.md), decisions and learnings [01-project-setup.md](../decisions/01-project-setup.md). This clears the phase's first exit criterion below. `apps/demo` stays deployable and untouched until `apps/web` reaches parity at T6, then is deleted.

  **Scope that moved out of T0**, so it is owed rather than forgotten:

  - **TypeScript 7.0.2.** The repo scaffolded on 5.9.3 (story ruling 2, [01-project-setup.md](../decisions/01-project-setup.md) ADR-7). TS 7 is the native-compiler rewrite and lands as its own commit with its own ADR, after every workspace exists to typecheck against. Still owed.
  - **`biome migrate`.** Carried over from Phase 1 (`00-sales-demo.md` ADR-21) and still owed; until it runs, `bunx biome check .` prints two tolerated informational diagnostics (schema pin 2.2.4 vs binary 2.5.8, and the `linter.rules.recommended` deprecation).
  - **A React Native test runner.** `apps/mobile` ships no tests — `bun test` cannot transform RN's Flow-typed source. Its own task, its own ADR.
  - **Gating `deploy.yml` on `ci.yml`.** Deliberately not done: it is a workflow-topology change with its own failure modes (fork runs, `workflow_dispatch` semantics). Deploy instead re-runs four of CI's six gates itself. Recorded so it stays a known choice.
  - **Dev-time cross-origin between `apps/web` and `apps/api`** — Vite proxy versus `VITE_API_URL` + `@fastify/cors`. Neither was installed; T2 settles it with the cookie transport.
  - **Every dependency the story's manifest lists for a later task** — `@fastify/*`, `pg-boss`, `resend`, `@supabase/supabase-js`, `posthog-*`, `react-native-purchases`, `expo-camera`, `expo-sqlite`, `expo-notifications`. Only `expo-secure-store` was installed at T0, so T1 has nowhere convenient to put a token.

  **Not yet proven:** no PR was opened during T0, so **CI has never run on a GitHub runner.** Every gate is green locally and each was shown to go red for the right workspace, but the Postgres service container coming up healthy, `postinstall` firing on `ubuntu-latest`, and GitHub accepting the workflow YAML are all unconfirmed until the first PR.
- **T1 — Auth schema + endpoints.** `sessions` table, argon2id via `Bun.password`, hashed opaque tokens, signup/login/logout/session routes, per-IP + per-account rate limits, `requireSession` middleware (Bearer + cookie).
- **T2 — Anonymous-first + web transport.** Device/browser gets a real user row + session with no email; email/password upgrade keeps the same user row. Web: httpOnly Secure SameSite=Lax cookie, CSRF Origin/Referer check on mutating routes.
- **T3 — Email flows.** Verification + password reset via Resend; tokens hashed at rest, single-use, 1h expiry.
- **T4 — Streak engine. — Done.** Start, continue, relapse-reset with lifetime stats preserved, timezone/midnight handling — pure functions in `packages/core`, full unit tests. Story [04-streak-timeline.md](../stories/04-streak-timeline.md), plan [04-streak-timeline.md](../plan/04-streak-timeline.md) and [04-streak-timeline-design.md](../plan/04-streak-timeline-design.md), decisions [04-streak-timeline.md](../decisions/04-streak-timeline.md).

  **The engine derives, it does not increment.** Nothing is stored as a counter — not the day count, not the best streak, not the lifetime total, not the freeze balance. The durable record is an append-only day log of one row per action, keyed `(userId, localDate, kind)`, and every number on screen is recomputed by a pure forward walk over it on every read. That is what makes a backdated check-in re-derive the past and an undo exact, and it is why two devices cannot disagree about a balance neither of them holds.

  **New scope: the streak freeze**, added here rather than left as an undocumented behaviour of the code. Seven consecutive check-in days earn one freeze; at most two are held at once; a freeze is spent automatically and silently on a missed day, and only while it protects an active run. The user never buys, equips, or activates one — they see, on the timeline, that it happened. **Freezes are derived like everything else**, from the same walk, so there is no balance to double-spend or drive negative. The two constants are **declared** in `packages/core/src/streakConfig.ts` and nowhere else — `deriveStreak` and the two surfaces' `FreezeBadge` components import them from there rather than restating either number. The gap rule is otherwise strict: a missed day with no freeze breaks the streak, and the freeze is the whole mitigation.
- **T5 — Persistence + sync. — Done.** One storage interface in `packages/core` (`DayLogStore`, six methods, no platform vocabulary) with two adapters behind it: **`expo-sqlite`** on mobile and **raw IndexedDB** on web. One shared conformance suite ships from `packages/core` and every adapter that can run in CI runs it — the in-memory store and the IndexedDB adapter — so an adapter that passes is interchangeable. **The SQLite adapter does not run it**: `bun test` cannot transform React Native's source, so `apps/mobile` ships no tests, and its conformance is owed to a device walk (`spec/decisions/04-streak-timeline.md` ADR-14). Sync is two routes on the API — `GET /day-log` and `POST /day-log`, both behind `requireSession`, both merged server-side with the *same* `mergeDayLog` the clients use — driven by a thin per-app runner over a pure `planSync` in core. **Failures are invisible to the user**: there is no sync status, no retry button, and no error toast on either surface, because the UI is given no way to learn that sync exists.
- **T6 — Quiz → plan → paywall.** Quiz funnel feeding the personalized plan and paywall copy; RevenueCat on mobile, RevenueCat Web Billing on web, one global price; webhook signature-validated by API. Lift the demo's screens into `apps/web` on the real core + adapter; build the same screens in `apps/mobile`.

  **Sequencing deviation, recorded rather than left implicit:** T6 was built and landed ahead of T4 (streak engine) and T5 (persistence + sync) — the funnel (quiz, plan, paywall, entitlement, account deletion) does not depend on either, and building the revenue spine first was judged the higher-value order this far from the January window. See [spec/decisions/03-quiz-plan-paywall.md](../decisions/03-quiz-plan-paywall.md) ADR-9 for the full reasoning and cost. This left the app-shell lift T6's own text describes — "lift the demo's screens into `apps/web`" — genuinely undone: `Today`, `Streak`, `Scan`, `TabBar`, and `AppShell` still live only in `apps/demo`, both surfaces' `/app/today` (`apps/web/src/routes/Today.tsx`, `apps/mobile/app/today.tsx`) are deliberate stubs saying the app is coming rather than the lifted real screens, and `apps/demo` is not yet deleted. That lift is owed before Phase 2's exit criteria can pass in full, and lands once T4 and T5 give it real streak and persistence state to lift onto.

  **The owed lift is now closed.** T4/T5 carried most of it: `AppShell`, `TabBar`, `StreakCard`, `TimelineList`, `UndoBanner`, and `FreezeBadge` exist in `apps/web/src/components/`, `Today.tsx` and `Streak.tsx` are the real screens under `/app/today` and `/app/streak`, the relapse overlay is `apps/web/src/overlays/Relapse.tsx`, and `apps/mobile` carries the same screens as an `app/(tabs)/` group over `src/components/` mirrors. **The Scan tab landed in Phase 3** (`apps/web`'s at P3.T4, once the lookup pipeline existed to put behind it; `apps/mobile`'s at P3.T3/T10 alongside `expo-camera` capture) — see [06-barcode-scan.md](../plan/06-barcode-scan.md). **Deleting `apps/demo` is deliberately not part of this branch**: it stays the only thing `deploy.yml` publishes and the only live URL, and removing that fallback in the same branch that first builds its replacement is a bad trade — see design [06-barcode-scan-design.md](../plan/06-barcode-scan-design.md) §1. The deletion gets its own change, after Phase 3 is proven, so `apps/web` reaching parity does not, by itself, close it.
- **T7 — Daily checklist. — Done.** Check-in, craving log, water — logic in `packages/core`, thin UI on both shells, works offline. Story [05-daily-checklist.md](../stories/05-daily-checklist.md), plan [05-daily-checklist.md](../plan/05-daily-checklist.md) and [05-daily-checklist-design.md](../plan/05-daily-checklist-design.md), decisions [05-daily-checklist.md](../decisions/05-daily-checklist.md).

  **The checklist is a view over the day log the streak already owns**, not a second habit store. `DayLogKind` widened with `TICK` and `CRAVING`, and every entry gained a `detail` (identity discriminator — the item id for a tick, the client-stamped instant for a craving) and a `trigger` (the picked trigger's content id). Offline, undo, LWW merge, and two-device convergence are therefore inherited from T4/T5 rather than rebuilt, and `deriveStreak` stays blind to both new kinds. **Content declares which item performs the check-in** via an `action` field, so no code names an item: adding, removing, or reordering a habit is a content-only change. Craving triggers are content too, and **no analytics event is emitted for a craving at all** — trigger values exist only in userId-scoped `day_log_entries` rows and the local stores.

  **Done means three of the story's four criteria, not four.** SQ-CHECK-04 ("see yesterday and the days before" — completed, missed, and relapse days distinguishable at a glance) is **not** delivered by T7 and is carried as owed. The design bullet that disposed of it claimed the streak screen's timeline already covered it; it does not — `TimelineList` renders authored milestones and freeze rows only, and `StreakSummary` exposes no relapse dates and only the current run's check-in dates, so a missed or relapse day is rendered nowhere. Closing it is new derivation in `packages/core` plus a new rendering on both surfaces, not a fix; it is scoped in the plan's §Owed to a human and reasoned in [decisions ADR-15](../decisions/05-daily-checklist.md). Nothing else depends on it, so it does not block T8.
- **T8 — Push reminders.** Expo Notifications, tokens registered with API, scheduling server-side via pg-boss. (Web push: post-MVP.) pg-boss itself now enters the repo a task early, at **P3.T1** (the barcode scanner's stale-cache refresh) rather than here — T8 was unbuilt when P3.T1 needed a queue, and STACK.md §5 already specified pg-boss regardless of which task installed it first (decisions ADR-8, `spec/decisions/06-barcode-scan.md`). With barcode withdrawn (Phase 3), that stale-refresh job is removed at P4.T9 but pg-boss stays installed, and T8 becomes its first consumer. T8 still owns the three sweep jobs auth (T1–T3) deferred until then: expired sessions, abandoned anonymous users (no email, no activity, older than 30 days, and never a row carrying an email or history), and spent `auth_rate_limits` windows. They are not pulled forward into P3.T1 — correctness does not depend on any of them running, `requireSession` rejects on `expires_at` regardless of whether the session row still exists, so their rows accumulate harmlessly until this task lands.

**Scope pulled forward from Phase 5, recorded so Phase 5 does not re-plan it.** T4 delivered **P5.T1 (timeline content, fused into the streak screen)** and **P5.T3 (relapse flow)** on both surfaces. The reason is that neither could sensibly be deferred: `timeline.json` and `timelineEntryFor` already existed from Phase 1 and needed no new content or code to fuse, and a streak screen showing a bare day counter with no story is precisely the commodity day-counter the Core Thesis (#3, "the streak is a story, not a number") says we are not building. Shipping the counter first and the story a phase later would have meant shipping the commodity. Phase 5's exit criteria are unchanged and still gate Phase 5 — being delivered early is not the same as being verified.

**Exit criteria**
- Expo app boots on a device/emulator; one Prisma migration applied to Supabase Postgres via the migration flow.
- Auth end-to-end on both surfaces: anonymous start → email upgrade (same user row) → logout → login on second device/browser → password reset. Sessions revocable server-side; tokens verified stored as hashes; auth routes rate-limited; web mutating routes reject cross-origin requests.
- Streak + checklist fully functional in airplane mode (mobile) and offline/refresh-surviving (web); `packages/core` tests cover relapse, timezone shift, midnight boundary, backdated check-in.
- A missed day covered by a held freeze holds the streak rather than breaking it, and the day it covered is visible on the timeline afterwards.
- Two devices converge: both check in offline, both reconnect, and each ends up with the same log and the same derived streak — with no sync status, retry button, or error message shown on either.
- Quiz → plan → paywall flow works on both surfaces; sandbox purchase + restore verified on mobile; web checkout completes in test mode; RevenueCat webhook validated by API.
- Push reminder arrives at the scheduled local time; scheduling lives in pg-boss, not the client.

## Phase 3 — Barcode scanner — withdrawn

**Withdrawn 2026-10-02. Barcode scanning is not part of the product** ([PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) §Product Boundaries). A barcode is not a dependable route to a free-sugars figure, so packaged food is scanned by photographing its nutrition label instead — Phase 4 T10. The phase keeps its number so that `P3.T…` commit ids already in history keep their meaning; it is never tagged, and the release sequence runs `v0.2.0` → `v0.4.0`.

**What the phase was** (for reading old commits and the documents under `06-barcode-scan`): T1 lookup pipeline (`product_cache`, OpenFoodFacts on miss, pg-boss stale-refresh), T2 verdict math, T3 mobile barcode capture, T4 web manual barcode entry, T5 miss and offline states. T1–T5 were built and reviewed; the exit criteria never passed, because the device walk they needed was never run. That walk is cancelled, not owed.

**What survives, now owned by Phase 4**
- **Verdict math (was T2).** Grams→teaspoons conversion and the red/yellow/green thresholds in `packages/core`, with their unit tests. Nothing about them was barcode-specific.
- **The Scan tab** on both surfaces (was T3/T4), as the shell the two photo modes live in.
- **The offline state** (was T5): no network is a graceful state on both surfaces, never an error screen.

**What is removed, at Phase 4 T9**
- The OpenFoodFacts client and the barcode lookup route.
- `product_cache` and its pg-boss stale-refresh job. pg-boss itself stays — Phase 2 T8 needs it.
- Barcode capture in `apps/mobile` and manual barcode entry in `apps/web`.
- The barcode-miss state ("not found — try a photo").

**Deleting `apps/demo`** was gated on Phase 3 being proven (Phase 2 T6 note). Phase 3 will never be proven; the gate moves to Phase 4's exit.

**Owed alongside this edit, not done by it:** [STACK.md](./STACK.md) §4 still describes the barcode pipeline; the story, plan, and decisions named `06-barcode-scan` need marking superseded; and the change needs its ADR in `spec/decisions/` ([PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) §Working Agreement 4).

## Phase 4 — Scanner: label read + food estimate + teaspoon verdict (web + mobile)

The whole scanner, per [STACK.md](./STACK.md) §4. Every scan is a photo and a vision call; there is no lookup path. Two modes share one route, one quota, and one verdict UI:

- **Label scan** — packaged food. The user photographs the nutrition label and the model *reads* the printed sugar figures. A transcription, not an estimate.
- **Food scan** — unpackaged food (dessert, chai, a plate). The model estimates, with a confidence.

The image is posted to Fastify → vision call → Zod-validated result → verdict. Capture: mobile camera; web uses a photo file upload into the identical pipeline. Photos are never stored — the bytes live only inside one request, so there is nothing to delete and nothing to leak. That holds for a label photo exactly as for a food photo.

**Tasks**
- **T1 — Photo + vision pipeline.** Image posted to the API as base64 in one request, vision call from Fastify behind a configurable driver, Zod-validated estimate (grams + confidence), verdict rendered from the same `packages/core` functions.
- **T2 — Quota + cost guard.** Per-user daily scan quota (free vs subscriber, values in `packages/core` config), one quota across both modes, enforced server-side before any external call; global daily spend ceiling with graceful degrade; every vision call logs tokens + cost to one metrics table. **The values need re-sizing:** they were set when the photo path was the fallback behind a free barcode lookup, and it is now the only path.
- **T3 — No-persistence proof.** The image is never written: no object storage, no disk, no column, no log line. Proven by tests over the route and by repo-wide greps in the plan's verification sweep, rather than by a delete step and a sweep for the orphans a delete step implies.
- **T4 — Mobile capture.** expo-camera photo → upload → verdict; low-confidence renders "couldn't read that", never a fabricated number.
- **T5 — Web upload.** File-upload path (photo picker) → the same API endpoint mobile posts to → same verdict UI.
- **T6 — Contract tests.** Recorded LLM fixtures; malformed/adversarial LLM output (bad JSON, absurd values) handled as errors — no live LLM calls in CI. The recorded OpenFoodFacts fixtures this task originally shared go at T9.
- **T7 — Verdict floor states + parity gate.** Two honest answers below half a teaspoon — zero and a trace — from one core predicate (`sugarFloorFor`) and authored copy, identical on both surfaces; a six-rule static gate (`bun run check:verdict-parity`) that makes SQ-VERDICT-05's promise checkable in CI rather than only in review. Phase 4 is the active phase — this finishes the verdict half of its name rather than pulling Phase 5 or 6 work forward.
- **T8 — Share artefact.** `packages/core` describes a 1080×1080 card; web paints it to a canvas and rasterises it; mobile captures the same design with `react-native-view-shot` and hands it to the OS share sheet through `expo-sharing`. **Needs re-scoping.** The card was built for barcode verdicts only, because a barcode lookup returned a product name and a photo estimate carries a margin the card has no field for. With barcode gone the card has no eligible source. A label read has no margin, so it is the natural replacement — but a nutrition label does not carry the product name the card prints. Where the name comes from (typed by the user, read from a second photo, or dropped from the card) is an open product decision for the label-scan story, and no verdict offers a share button until it is made.
- **T9 — Barcode removal.** Delete what Phase 3 lists as removed, on both surfaces and the API, in steps that each leave CI green. `product_cache` follows the migration rule in §Rollback: the code stops using it in this phase, and the drop migration lands one phase later. The recorded OpenFoodFacts fixtures and their contract tests go with the client.
- **T10 — Label scan.** A label mode on the Scan tab — camera on mobile, file upload on web — posting to the same route as the food scan. The model transcribes the printed sugar figures (total sugars, added sugars where the label states them, the per-100 g or per-serving basis, and the serving or pack size); the result is Zod-validated and the verdict computed by the same `packages/core` functions. A label that is blurred, cropped, or shows no sugar line answers "couldn't read that" and never falls through to a food estimate. A label verdict renders as a read, without the margin a food estimate carries. **Needs its story first** (§Stories, Plans, Commits & Versioning) — including how free sugars are scored from a label that prints only total sugars, which this file does not settle.

**Exit criteria**
- Label photo of a real packaged product returns a teaspoon verdict on both surfaces that matches the figures printed on the pack; a blurred or partial label returns "couldn't read that" — never a guess, and never a food estimate.
- Photo of unpackaged food (dessert, chai) returns a teaspoon verdict with confidence on both surfaces; low-confidence returns "couldn't read that", never a fabricated number.
- Quota enforced server-side across both modes: free user hits cap and sees upgrade prompt; subscriber cap higher; both from `packages/core` config — identical on web and mobile.
- Cost guard tested: with ceiling forced to zero, scanning degrades gracefully — no 500, a clear "scanning is unavailable right now" state, and streak, checklist, and timeline untouched.
- No write of the image anywhere, proven rather than asserted: the route's tests show nothing is persisted, and the plan's verification greps fail if a storage client, a filesystem write in `apps/api/src`, or a `Bytes` column ever appears.
- **Accuracy pass:** twenty real items with verifiable sugar, photographed with the label out of frame, estimated and compared against the truth. The gate catches admitted uncertainty and absurd values; it does not catch confidently wrong, and a 27B open-weights model is likelier to be confidently wrong than a frontier one. A poor pass is a config change (`VISION_DRIVER`, `VISION_BASE_URL`, `VISION_MODEL`), which is the entire reason the driver seam exists — but it is a change that has to happen before this phase is Done.
- **Label pass:** twenty real labels photographed in ordinary shop conditions; the figure read must equal the figure printed. A wrong read is worse than a wrong estimate, because it is presented as fact.
- Malformed/adversarial LLM output handled as errors in contract tests — no live LLM calls in CI.
- A zero-sugar product and a product under half a teaspoon render two different honest states on both surfaces — neither of them "0.0 teaspoons".
- The parity gate passes, and each of its six rules has been watched to fail, per [08-verdict-teaspoons.md](../plan/08-verdict-teaspoons.md)'s S77.
- Barcode is gone, proven rather than asserted: repo-wide greps find no OpenFoodFacts client, no barcode capture or entry on either surface, and no code reading `product_cache`.
- The share artefact's source is decided and built (T8): a shared verdict lands as a legible 1080×1080 image through the OS share sheet on mobile and `navigator.share` / download / copy on web; a food estimate offers no share button.

**T1–T8 are built and reviewed; T9 and T10 are not started, and T8 needs
re-scoping.** What follows describes T1–T8 as they stood before barcode was
withdrawn, amended where the withdrawal changes what is owed.

Of the six exit criteria T1–T6 were written against, two cannot be proven from a
laptop; of the three T7–T8 added, two more cannot either. Counted rather than
estimated, because an earlier draft of this paragraph said "three of six" and
also called only two of them provable, and both numbers were wrong.

The two original criteria that need a phone and real food are the unpackaged-food
photo (a dessert and a cup of chai, and a dark blurred frame answering "couldn't
read that") and the accuracy pass. The other four passed in tests: the quota,
the cost guard, the proof that no image is written anywhere, and the
malformed/adversarial LLM handling. The cost-guard criterion then read "barcode
still works"; it is reworded above, and its test is rewritten at T9. The
camera-indicator check Phase 3 owed was never run; it now belongs to this
phase's walk, exercised with the two photo modes once T10 exists.

Of T7–T8's three, the parity gate passes in CI and needs nothing. The other two
join the device walk: **the share walk on a real device** — the sheet opens, the
image that lands in the target app is the card and not a blank view, and the
tempfile is gone afterwards — which now also waits on T8's re-scope, and **the
two floor states rendered on a phone**, which are proven by test on web and by
nothing at all on mobile, since `apps/mobile` ships no test runner. The card has
never been rasterised anywhere in this repo either: happy-dom has no canvas, so
every web test takes the `null` path and no PNG has been produced by CI or a
laptop. See [07-photo-scan.md](../plan/07-photo-scan.md)'s §Owed to a human and
[08-verdict-teaspoons.md](../plan/08-verdict-teaspoons.md)'s §Owed to a human
for the full lists, which also carry two things that must happen before a paid
deploy: recording the provider fixtures against the real service once, and
setting `VISION_DAILY_CEILING_MICROS` the day the provider stops being free.
No tag, and the Status row above does not flip to Done, until every one of
these is run and T9 and T10 are done.

## Phase 5 — Body timeline + craving SOS (web + mobile)

The retention content, on both surfaces.

**Tasks**
- **T1 — Timeline content. — Delivered in Phase 2 T4.** Day-by-day withdrawal timeline (day 1–30+) as schema-validated JSON in `packages/content`, fused into the streak screen on web and mobile. See the Phase 2 note above for why it moved. Not re-planned here; this phase's exit criteria still gate it.
- **T2 — Craving SOS.** One button → 5-minute delay timer + swap suggestions from content; works offline; craving log captures the outcome (rode it out / relapsed) — both surfaces.
- **T3 — Relapse flow. — Delivered in Phase 2 T4.** Counter resets, lifetime stats and timeline story persist, zero shame copy — reviewed against thesis. Shipped with same-day undo on both surfaces, and with an automated zero-shame lexicon gate over all authored copy in `packages/content`. The human tone review the criterion asks for is still owed; the gate cannot judge tone.
- **T4 — Polish pass.** Copy pass, empty states, performance, accessibility basics (touch targets, screen-reader labels, keyboard nav on the web core loop).

**Exit criteria**
- Timeline day renders from content JSON keyed by streak day on both surfaces; adding day-45 content requires zero code changes; invalid content fails CI.
- SOS button → timer + swaps works offline on both surfaces; craving log captures the outcome.
- Relapse flow reviewed against thesis: counter resets, lifetime stats and timeline story persist, zero shame copy.
- Full loop demo on web **and** mobile: quiz → paywall → streak day 4 shows "cravings peak today" → scan a product → SOS a craving.

## Phase 6 — Launch (web production + stores, pre-January)

**Hard gate: web live in production and apps live in stores by mid-December.** Store review lead time is the long pole — submit early.

**Tasks**
- **T1 — Web production.** Domain, hosting, error monitoring, uptime check. The API must be served from a **sibling subdomain** of the web app under one registrable domain (`app.<domain>` / `api.<domain>`): the session cookie is `SameSite=Lax`, which is not sent cross-site, so a `*.pages.dev` web front end calling an API on an unrelated domain would fail as a silent signed-out state rather than a visible error.
- **T2 — Store rollout.** Listings, review submission with lead-time buffer, crash monitoring, staged rollout to production on both stores.
- **T3 — Funnels.** PostHog on both surfaces: quiz completion → paywall conversion, scan frequency, D1/D7 retention, relapse rate, web→mobile crossover.
- **T4 — Growth seed.** Seed TikTok "sugar detox" creators with teaspoon-verdict shock content. **P6.T4 keeps the growth campaign** — Phase 4's T8 built the mechanism this task uses (the card, the capture, the OS share sheet), not the campaign itself. SQ-VERDICT-04's roadmap line reads "P1.T4 (screen), P6.T4 (growth use)": the share button is the P1.T4 screen affordance, lifted late into Phase 4 because it needed the verdict work T7 shipped beside it, not because the growth use moved.
- **T5 — Iterate.** Review triage loop; fix before adding.

**Exit criteria**
- Web app live on production domain; live on both stores with crash-free rate >99% — all before mid-December.
- Funnel dashboard answering: does the scanner drive daily opens? (scans/user/day, quiz→paid conversion, D1/D7) — segmented by surface.
- Review triage loop running; top complaint themes fed back into this roadmap.

## Phase 7 — January cohort challenge (web + mobile)

The acquisition event, live for January 1. No feed, no chat — a shared counter and shared pushes.

**Tasks**
- **T1 — Cohort schema + endpoints.** `cohorts`, `cohort_members` tables, join route, daily cohort check-in count.
- **T2 — Join flow + cohort screen.** Join the January cohort, see member count + today's check-in count, check-in increments it — on web and mobile.
- **T3 — Push fan-out.** Cohort-wide day-N pushes via pg-boss — one job per cohort fans out to members, idempotent (re-run sends no duplicates). Mobile push only; web sees the same cohort state in-app (web push: post-MVP).
- **T4 — Completion.** Day-30 awards a badge and rolls members back to solo streak cleanly.

**Exit criteria**
- User joins the January cohort on either surface, sees member count + today's check-in count; check-in increments it on both.
- Day-N push reaches all cohort members via one pg-boss fan-out job; job idempotent (re-run sends no duplicates).
- Cohort completion (day 30) awards a badge and rolls members back to solo streak cleanly.
- Live in production (web + stores) before January 1.

## Phase 8 — Post-MVP (unordered backlog — promote via roadmap PR)

- Scan history + weekly "sugar avoided" report (teaspoons dodged).
- Widget: streak day + today's timeline headline on home screen.
- Recurring cohorts beyond January (monthly starts, invite-a-friend cohorts).
- Expanded content: 90-day timeline, recipe swaps, trigger-specific SOS packs.
- Content hot-delivery via Supabase Storage (no-release content drops).
- Web push notifications; in-browser camera capture on web if demand shows up.

Promotion rule: an item moves from Phase 8 into a numbered phase only via a PR editing this file, with exit criteria defined at promotion time.
