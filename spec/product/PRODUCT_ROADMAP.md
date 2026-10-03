# PRODUCT_ROADMAP.md — Development Phases

> Part of the spec triad: [PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) (what & why) · **PRODUCT_ROADMAP.md** (when) · [STACK.md](./STACK.md) (with what).
> **Timing constraint:** the January demand spike is the business ([PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md) §Core Thesis). Phases 0–5 must complete before mid-December; the cohort challenge (Phase 6) goes live for January 1. Slipping past January means waiting a year — scope gets cut before dates do.
> **Rewritten 2026-10-03 for a clean rebuild.** Nothing is built. The earlier roadmap described a previous repo on a different stack; it is in this file's git history and is not a record of this repo.

## Rules for agents

- **One phase at a time.** Build only the active phase. Features from later phases are out of scope even if adjacent code is open.
- **Exit criteria gate the phase.** A phase is complete when every exit criterion passes, not when code merges. The next phase does not start early.
- **Scope changes edit this file**, in the same change, so the spec never lies.
- **Status is kept current.** This file is the single source of truth for "where are we."
- **Estimates are working budgets, not deadlines** — except the January gate above. Blowing an estimate triggers a scope conversation, not silent overtime.
- **One app, three surfaces.** Every user-facing feature works on iOS, Android, and web in the change that adds it ([STACK.md](./STACK.md) §6). Photo capture is the camera on mobile and file upload on web.
- **Stable dependencies only** ([STACK.md](./STACK.md) §2, Dependency policy).

## Spec Workflow, Commits & Versioning

**Product → story → module → plan → build → decisions.** Development is spec-driven: every stage is a file under `spec/`, and each stage is written from the one before it.

| Folder | What a file is | Written by | Path |
|---|---|---|---|
| `spec/product/` | What, when, and with what — this triad | Product owner with the agent | `spec/product/*.md` |
| `spec/stories/` | One slice of the product: what it delivers, its acceptance criteria, what is out of scope | Agent | `spec/stories/NN-<story>.md` |
| `spec/modules/` | One buildable unit of a story: its purpose, its interface to other modules, its acceptance criteria, what it depends on | Agent, or the product owner when they choose | `spec/modules/NN-<story>/MM-<module>.md` |
| `spec/plan/` | How one module gets built: ordered steps, files touched, risks, verification checks | Agent | `spec/plan/NN-<story>/MM-<module>.md` |
| `spec/decisions/` | What the agent decided while building one module: the choice, what was rejected, why, and what was learned | Agent | `spec/decisions/NN-<story>/MM-<module>.md` |

- **A story covers one roadmap phase or a slice of one.** It names the phase and the roadmap tasks it covers, and its acceptance criteria trace to that phase's exit criteria.
- **The module is the unit of work.** One module gets one plan, one build, and one decisions file, all at the same path in their folders, so any of the three leads to the other two.
- **Each stage is approved before the next begins.** The product owner approves a story before it is broken into modules, the modules before plans are written, and a plan before any code. A module the product owner wrote needs no approval.
- **A step's checkbox is ticked in the plan in the same commit that completes it.**
- **Decisions are written as they are made**, not reconstructed afterwards ([STACK.md](./STACK.md) §11).

**Commit rules**
- **One plan step = one commit, pushed to GitHub.** If a step is too big for one commit, split it in the plan first.
- **Spec changes are their own `docs:` commits**, never mixed with code — except ticking a step's checkbox.
- Format: `<type>(<scope>): S<story>.M<module>.<step> <summary>`, e.g. `feat(core): S02.M01.3 streak survives timezone change` for step 3 of module 01 of story 02. Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`. Scopes: `core`, `content`, `api`, `app`, `spec`.
- **No co-author or tool-attribution trailers** on any commit.
- Every commit leaves the gates in [STACK.md](./STACK.md) §12 green. The one permitted red is a failing test committed on purpose, made green by the very next commit.

**Rollback**
- Every commit is a rollback point: the repo builds and runs at each one.
- A step spanning code, schema, and content lands them in one commit, in a compatible state.
- Migrations are forward-only and additive first. A destructive change lands one phase after the code stops using what it removes, so rolling back the app never requires rolling back the database.
- Rollback is `git revert` or redeploying an earlier tag. Never `git reset` or a force-push on `main`.

**Versioning**
- Finishing Phase N tags `v0.N.0`, in the commit that flips its Status to Done. Fixes after a tag bump the patch number.
- `v1.0.0` is the Phase 5 launch build.

## Status

| Phase | Name | Estimate | Status |
|---|---|---|---|
| 0 | Foundation | 3–4 days | Not started |
| 1 | Streak core, offline | 1.5 weeks | Not started |
| 2 | Accounts, sync, quiz → paywall | 2 weeks | Not started |
| 3 | Scanner and teaspoon verdict | 2 weeks | Not started |
| 4 | Craving SOS, reminders, polish | 1 week | Not started |
| 5 | Launch (web + stores, before mid-December) | about 3 weeks, mostly store review | Not started |
| 6 | January cohort challenge | 1–2 weeks | Not started |
| 7 | Post-MVP | — | Not started |

**The schedule has no slack.** Phases 0–4 budget about seven weeks from 2026-10-05, ending in late November, which leaves roughly three weeks for launch before the mid-December gate. Proposed cut order if a phase overruns: the share card (P3.T8) first, then web checkout (P2.T6) — web users would subscribe in the mobile app and still sign in on web.

**No separate sales demo** (confirmed by the product owner, 2026-10-03). The earlier roadmap opened with a throwaway web demo on fake data. With one Expo codebase the real app runs on web from Phase 0, so that week is spent on the product instead.

---

## Phase 0 — Foundation

A working toolchain on every surface, deployed, before any feature.

**Tasks**
- **T1 — Repo.** pnpm workspace, strict `tsconfig`, Biome, `.gitignore`, README.
- **T2 — Version pins.** Resolve the first item of [STACK.md](./STACK.md) §14: the newest Expo SDK that Clerk, RevenueCat, and Sentry all support. Record every pinned version and its stable status in an ADR.
- **T3 — Packages.** `packages/core` and `packages/content` with one real test each; content validated by Zod in CI.
- **T4 — API.** Fastify with `GET /health`, Prisma, a `users` table, and the first migration applied by the deploy flow to managed Postgres.
- **T5 — App.** Expo app with Expo Router that boots as an iOS development build, an Android development build, and a web export.
- **T6 — CI and deploy.** GitHub Actions running the [STACK.md](./STACK.md) §12 gates on every PR; API deployed to its host; web export deployed to its static host.

**Exit criteria**
- All §12 gates green in CI on a pull request.
- The app boots on an iOS device or simulator, an Android device or emulator, and in a browser.
- `GET /health` answers at the deployed API URL; one migration was applied by the deploy flow, not by hand.
- The version ADR exists and lists no pre-release dependency.

## Phase 1 — Streak core, offline

The retention spine. No account, no network: everything here runs from the device's own store.

**Tasks**
- **T1 — Streak engine.** Pure functions in `packages/core`: start, continue, relapse with lifetime stats preserved, timezone and midnight handling. Everything is derived by a forward walk over an append-only day log; no counter is stored.
- **T2 — Streak freeze.** Seven consecutive check-in days earn one; at most two are held; one is spent automatically on a missed day. Derived from the same walk. The two constants are declared once in `packages/core`.
- **T3 — Local store.** The `DayLogStore` interface with `expo-sqlite` (iOS, Android) and IndexedDB (web) adapters, plus one conformance suite every adapter passes.
- **T4 — Timeline content.** Day-by-day withdrawal timeline, day 1–30+, as validated JSON in `packages/content`.
- **T5 — Today and Streak screens.** Day counter fused with the timeline story, freeze shown where it was spent.
- **T6 — Relapse flow.** Counter resets, lifetime stats and the story persist, same-day undo, zero-shame copy, with an automated lexicon check over authored copy.
- **T7 — Daily checklist.** Check-in, craving log, water — a view over the day log, not a second store. Which item performs the check-in is declared in content.
- **T8 — Day history.** Completed, missed, frozen, and relapse days distinguishable at a glance.

**Exit criteria**
- Streak and checklist work fully in airplane mode on mobile and offline on web, and survive a restart or refresh.
- `packages/core` tests cover relapse, timezone shift, midnight boundary, and a backdated check-in.
- A missed day covered by a held freeze holds the streak, and that day is visible on the timeline afterwards.
- A timeline day renders from content keyed by streak day; adding a day-45 entry needs no code change; invalid content fails CI.
- No analytics event carries a craving trigger or any quiz answer.

## Phase 2 — Accounts, sync, quiz → paywall

The revenue spine. Identity per [STACK.md](./STACK.md) §3; payments per §8.

**Tasks**
- **T1 — Sign-up and sign-in.** Clerk in the app: prebuilt components on web, our own screens on Clerk's hooks on iOS and Android.
- **T2 — API identity.** `requireUser` over `@clerk/fastify`; a `users` row keyed by the Clerk user id, created on the first authenticated request; `userId`-required repository helpers.
- **T3 — Sync.** `GET /day-log` and `POST /day-log`, merged server-side with the same `mergeDayLog` the app uses. The first sync after sign-up uploads the local log. Failures are silent: no status, no retry button, no error toast.
- **T4 — Quiz → plan.** Quiz funnel feeding the personalized plan, both running with no account.
- **T5 — Paywall on iOS and Android.** Sign-up at the paywall, then purchase through RevenueCat; restore purchases.
- **T6 — Paywall on web.** RevenueCat Web Purchase Link to Paddle's hosted checkout.
- **T7 — Entitlement.** Signature-verified RevenueCat webhook → `entitlement` per user in the API; the app gates on what the API says.
- **T8 — Account deletion.** In-app deletion removes our rows and the Clerk user; Clerk's `user.deleted` webhook is the backstop.

**Exit criteria**
- Sign up on one device, sign in on a second, and see the same day log and the same derived streak.
- Two devices check in offline, reconnect, and converge — with no sync status, retry button, or error shown on either.
- Quiz → plan → sign-up → paywall works on all three surfaces; sandbox purchase and restore verified on iOS and Android; web checkout completes in Paddle's sandbox.
- The entitlement webhook is rejected when its signature is wrong.
- Account deletion leaves no row for that user and no Clerk user.
- The database holds no password, session, or reset token.

## Phase 3 — Scanner and teaspoon verdict

The daily hook, per [STACK.md](./STACK.md) §4. Every scan is a photo and a vision call; there is no lookup path.

**Product decisions the scanner story must settle before its modules are written**
1. How free sugars are scored from a label that prints only total sugars.
2. Where the share card's product name comes from, since a nutrition label does not carry one: typed by the user, read from a second photo, or left off the card.
3. The daily scan quota for free and subscribed users, now that every scan is a paid call.

**Tasks**
- **T1 — Verdict math.** Grams → teaspoons and the red/yellow/green thresholds in `packages/core`, including the two honest states below half a teaspoon: zero and a trace.
- **T2 — Scan route and driver.** `POST /scan` with the `openai` SDK driver, pointed at Gemini; Zod-validated result; verdict computed by `packages/core`.
- **T3 — Label mode.** Transcribes the printed sugar figures: total sugars, added sugars where stated, the per-100 g or per-serving basis, and the serving or pack size. An unreadable label answers "couldn't read that" and never falls through to an estimate.
- **T4 — Food mode.** Estimates sugar in unpackaged food with a confidence; low confidence answers "couldn't read that".
- **T5 — Quota, spend ceiling, metering.** One per-user daily quota across both modes and a global daily ceiling, both checked before any external call; every call logged to `scan_metrics`.
- **T6 — No-persistence proof.** Route tests and repo-wide greps showing the image is never written anywhere.
- **T7 — Scan screens.** Camera on mobile, upload on web, resize on the device, then the verdict: teaspoons first, traffic light, grams second. Offline, quota-reached, and unavailable states are graceful, never an error screen.
- **T8 — Share card.** A 1080×1080 image of the verdict through the OS share sheet on mobile and `navigator.share` or download on web. Scope depends on decision 2 above.
- **T9 — Contract tests.** Recorded model responses, including malformed and adversarial output; no live model calls in CI.

**Exit criteria**
- A label photo of a real packaged product returns a teaspoon verdict matching the printed figures on all three surfaces; a blurred or partial label returns "couldn't read that".
- A photo of unpackaged food returns a teaspoon verdict with a confidence; low confidence returns "couldn't read that", never a fabricated number.
- **Label pass:** twenty real labels in ordinary shop conditions; the figure read equals the figure printed.
- **Food pass:** twenty real items with verifiable sugar, label out of frame, estimated and compared against the truth.
- Quota enforced server-side from `packages/core` config: a free user hits the cap and sees the upgrade prompt; a subscriber's cap is higher.
- With the ceiling forced to zero, scanning degrades to a clear "unavailable right now" state — no 500 — and streak, checklist, and timeline are untouched.
- No write of the image anywhere, shown by the route tests and the greps.
- A zero-sugar product and one under half a teaspoon render two different honest states, neither of them "0.0 teaspoons".
- Only our own test photos have been sent to the free vision tier.

## Phase 4 — Craving SOS, reminders, polish

**Tasks**
- **T1 — Craving SOS.** One button → 5-minute delay timer and swap suggestions from content; works offline; the craving log records the outcome (rode it out or relapsed).
- **T2 — Push reminders.** `expo-notifications`, device tokens registered with the API, scheduling in pg-boss at the user's local time. Web push is post-MVP.
- **T3 — Polish pass.** Copy, empty states, performance, accessibility basics: touch targets, screen-reader labels, keyboard navigation on web.
- **T4 — Tone review.** A human read of all authored copy against the zero-shame thesis; the lexicon check cannot judge tone.

**Exit criteria**
- SOS → timer and swaps works offline on all three surfaces, and the outcome is in the day log.
- A push reminder arrives at the scheduled local time; scheduling lives in pg-boss, not the client.
- Full loop on web and mobile: quiz → sign-up → paywall → streak day 4 shows "cravings peak today" → scan a product → SOS a craving.
- The tone review is done and its changes are merged.

## Phase 5 — Launch (web + stores, before mid-December)

**Hard gate: web live in production and apps live in both stores by mid-December.** Store review is the long pole — submit early. Developer-account and Paddle approvals are owned by the product owner and start in October ([STACK.md](./STACK.md) §14).

**Tasks**
- **T1 — Launch vision model.** Switch config to an OpenAI model; re-run the label and food passes on it; confirm retention terms; set `VISION_DAILY_CEILING_MICROS` from its real price ([STACK.md](./STACK.md) §4).
- **T2 — Production.** `app.<domain>` and `api.<domain>`, Clerk production instance, RevenueCat and Paddle live mode, Sentry, uptime check.
- **T3 — Store rollout.** Listings, review submission with a lead-time buffer, staged rollout on both stores.
- **T4 — Funnels.** PostHog: quiz completion → paywall conversion, scans per user per day, D1/D7 retention, relapse rate, by surface.
- **T5 — Growth seed.** Seed "sugar detox" creators with teaspoon-verdict content.
- **T6 — Triage loop.** Review and crash triage; fix before adding.

**Exit criteria**
- Web app live on the production domain; both store listings live with a crash-free rate above 99% — all before mid-December.
- Production scans run on the paid launch model, both passes having been re-run on it; no production path points at a free tier.
- A real purchase completes on each of iOS, Android, and web, and reaches the API as an entitlement.
- The funnel dashboard answers "does the scanner drive daily opens?"
- Tagged `v1.0.0`.

## Phase 6 — January cohort challenge

The acquisition event, live for January 1. No feed, no chat — a shared counter and shared pushes.

**Tasks**
- **T1 — Cohort schema and endpoints.** `cohorts`, `cohort_members`, a join route, the daily cohort check-in count.
- **T2 — Join flow and cohort screen.** Member count and today's check-in count; a check-in increments it.
- **T3 — Push fan-out.** Cohort-wide day-N pushes: one pg-boss job per cohort fans out to members, idempotent on re-run.
- **T4 — Completion.** Day 30 awards a badge and returns members to the solo streak cleanly.

**Exit criteria**
- A user joins the January cohort on any surface and sees member count and today's check-in count; a check-in increments it everywhere.
- A day-N push reaches all cohort members through one fan-out job; re-running it sends no duplicates.
- Day 30 awards the badge and the solo streak continues.
- Live in production, web and stores, before January 1.

## Phase 7 — Post-MVP (unordered backlog)

- Scan history and a weekly "sugar avoided" report.
- Home-screen widget: streak day and today's timeline headline.
- Recurring cohorts beyond January; invite-a-friend cohorts.
- Expanded content: 90-day timeline, recipe swaps, trigger-specific SOS packs.
- Content delivered without an app release.
- Web push notifications; in-browser camera capture on web.

Promotion rule: an item moves into a numbered phase only by editing this file, with exit criteria defined at that time.
