# PRODUCT_CONTEXT.md — What We're Building & Why

> Part of the spec triad: **PRODUCT_CONTEXT.md** (what & why) · [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) (when) · [STACK.md](./STACK.md) (with what).
> Source research: [./product-idea.md](./product-idea.md). Any agent working in this repo MUST read all three spec files before writing code.

## What We Are Building

A quit-sugar app: the proven streak/recovery engine (Quittr playbook) combined with a narrow sugar scanner that answers exactly one question — "how much sugar is in this?" Sugar reduction is a mass-market, annually recurring goal (every January), tied to weight, skin, energy, and diabetes fear, yet the category leader earns under $5K/month and the space is fragmented day-counter micro-apps. Counters have no food tools; food apps have no quit mechanics. We ship both, before January.

## Core Thesis

1. **The scanner is the daily hook.** Streak counters get opened once a day; a scanner gets opened in the supermarket aisle, multiple times a day. Every scan is a photo. For packaged food the user photographs the nutrition label and the model *reads* the printed figure — a transcription, not a guess; for plates and chai it estimates. Every scan ends in a verdict, not a nutrition table.
2. **Teaspoons, not grams.** "39g of sugar" is a label; "10 teaspoons" is a shock. Every verdict renders teaspoons first with a red/yellow/green traffic light. Visceral units are the behavior-change trick no competitor uses — and the shareable "this drink is 16 teaspoons" moment is our organic acquisition.
3. **The streak is a story, not a number.** Sugar withdrawal has a well-documented day-by-day arc (dopamine reset, cravings peak, skin, energy). The streak screen narrates it: "Day 4: cravings peak today — here's why." A relapse resets the counter but keeps lifetime progress visible — the story continues, the user isn't shamed back to zero-worth.
4. **January is the business.** A predictable, free, annual demand spike no app owns. The cohort challenge (30-day group no-sugar challenge) is built to own "Sugar-Free January" — and the whole app must be live and stable before the spike, not during it.

> The scored quantity is **free sugars** as WHO defines them: added sugars plus honey, syrups, and fruit-juice sugars, excluding sugars naturally present in whole fruit, vegetables, and milk. Plain yoghurt scores zero; "no added sugar" juice does not. That gap is the product.

## Product Surface (MVP)

- **Quiz funnel:** sugar habits, triggers, health goals → personalized "sugar-free plan" → hard paywall (RevenueCat). The quiz and plan need no account; sign-up happens at the paywall, just before purchase.
- **Streak + body timeline:** day counter fused with "what's happening in your body today," day 1–30+. A week of unbroken check-ins earns a **streak freeze** (at most two held) that is spent automatically on a missed day and shown on the timeline afterwards — ordinary life does not cost the story, and nothing is stored: the balance is derived from the same log as the streak.
- **Label scan:** photo of a packaged product's nutrition label → the vision LLM reads the printed sugar figures → free-sugars verdict — traffic light + teaspoon visualization.
- **Food scan:** vision-LLM sugar estimate for unpackaged food (dessert, chai, cereal), same verdict UI.
- **Daily checklist:** check-in, log cravings, water, protein-swap suggestion.
- **Craving SOS:** one button → 5-minute delay timer + swap suggestions from content.
- **January cohort challenge:** 30-day cohort, daily group check-in count, cohort-wide day-N pushes.

## Product Boundaries (explicitly out)

- **No calorie tracking, no macros, no meal diary.** Sugar only. The moment we track calories we're a worse Cal AI; the narrowness is the product.
- **No food photo retention.** Scan photos are never stored at all — not to object storage, not to disk, not to a column, not to a log line ([STACK.md](./STACK.md) §4, §7). We are not building a dataset of users' meals, and there is no dataset to build one from.
- **No chat, no AI coach.** The LLM estimates sugar; it never converses. Timeline and SOS copy is authored, not generated.
- **No social feed/friends at MVP.** Cohorts are a counter and a shared push, not a feed. Social beyond that waits for retention proof.
- **Web and mobile are one app.** A single Expo codebase serves iOS, Android, and web ([STACK.md](./STACK.md) §6), so a feature lands on all three in the same change — no surface drifts ahead. Photo *capture* is the device camera on mobile; web reaches the same scan pipeline via photo upload.
- **No ads, no data selling.** Revenue is subscription only.
- **No barcode scanning, no food database.** A barcode is not a dependable route to a sugar figure: the public product databases behind it carry total sugars at best, have gaps, and say nothing about unpackaged food. The label on the pack is the source of truth for packaged goods, read by the scanner each time — no OpenFoodFacts, no product cache, no catalogue of our own to curate.

## Architectural Constraints

- **API is the single gateway.** The app talks only to our Fastify API for product data — never to Postgres or any LLM directly. Two managed SDKs are the exceptions, each for the one thing it owns: Clerk for sign-in and the payments SDK for purchases. Identity is Clerk's ([STACK.md](./STACK.md) §3): the API verifies Clerk session tokens and keys every row by the Clerk user id; it stores no passwords and issues no sessions of its own. There is no object storage anywhere in the stack.
- **One domain core.** Streak engine, teaspoon conversion, verdict thresholds, quota math — pure TypeScript in `packages/core`, shared by client and server. No logic forks.
- **Scanner is server-side composition.** Label read, food estimate, quota, and cost guard all live in the Fastify API ([STACK.md](./STACK.md) §4). No Python service, no Docker sidecar — it's HTTP out, JSON back.
- **Offline-first except scans.** Streak, checklist, craving log, and timeline work in airplane mode; only scanning requires network, and it degrades gracefully.
- **Content is data.** Timeline days, SOS swaps, checklist items, quiz questions are schema-validated JSON — adding content requires no app release.
- **Cost is bounded by design.** There is no free path — every scan is a vision call — so per-user quotas and a global spend ceiling are the whole cost model, enforced server-side before any external call. The scanner can go viral without the bill doing the same.

## Engineering Quality Bar

- `packages/core` is fully unit-tested — every streak transition (start, continue, relapse, timezone shift, midnight boundary), teaspoon rounding, verdict threshold, and quota edge case. This logic is the product; bugs here are product failures.
- A label scan is a read, not an estimate: the verdict comes from the figures printed on the pack, and a blurred, cropped, or partial label is a handled "couldn't read that — try again" — it never falls through to a guess.
- Vision-LLM output is untrusted input: Zod-validated, confidence-gated, and a malformed response is a handled "couldn't read that — try again" state, never a crash or a fabricated verdict.
- Strict TypeScript, Biome-clean, CI green — non-negotiable on every PR. See [STACK.md](./STACK.md) §12.
- Every user-scoped query goes through `userId`-required repository helpers, keyed by the Clerk user id the API verified; we hold no passwords or session tokens; scan photos verifiably never written anywhere, which tests and repo-wide greps both check. Craving logs and quiz answers are sensitive — DB rows only, never in analytics events.
- Analytics events are named in one registry module; no ad-hoc event strings.

## Working Agreement

How agents (human or AI) work in this repo:

1. **Read the triad first.** This file, [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md), and [STACK.md](./STACK.md) define scope, sequence, and tools. Work outside them requires updating the spec in the same PR — spec and code never diverge.
2. **Roadmap discipline.** Build only the current phase in [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md). No pulling features forward "while we're in there." Each phase has exit criteria; a phase is done when they pass, not when the code exists.
3. **Simplest thing that works.** Reuse before writing, stdlib/platform before dependencies, one line before fifty. Speculative abstraction is a defect.
4. **Decisions are recorded.** Stack swaps, new services, new packages, any change to the photo-retention rule → ADR in `spec/decisions/` ([STACK.md](./STACK.md) §11), in the decisions file of the module that makes the change, alongside that module's learnings. If a future agent would ask "why is it like this?", write it down.
5. **Product → story → module → plan → build → decisions.** Development is spec-driven. The agent writes a story for each roadmap phase in `spec/stories/`; the story is broken into modules in `spec/modules/` by the agent, or by the product owner when they choose; the agent writes a plan for each module in `spec/plan/` and records what it decided while building it in `spec/decisions/`. Each stage is approved before the next begins, and no code is written before its module's plan is agreed. Full workflow in [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) §Spec Workflow, Commits & Versioning.
6. **Commit history is the log.** Stories break into modules, modules into plan steps; each step completion is one Conventional Commit pushed to GitHub, doc updates are separate `docs:` commits, phase completion tags a `v0.N.0` release. Full rules in [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) §Spec Workflow, Commits & Versioning.
7. **Thesis is a test.** Before shipping anything, check it against Core Thesis: does it dilute the sugar-only focus? does it retain a photo? does it risk missing January? If yes, it doesn't ship — regardless of who asked.
