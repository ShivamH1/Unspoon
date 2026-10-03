# Module 01.07 — Deploy

> **Story:** [01 — Foundation](../../stories/01-foundation.md) · **Covers:** S01-AC6, S01-AC7, S01-AC8, S01-AC10 · **Depends on:** 01.05, 01.06
> **Status:** Approved 2026-10-03.

## Purpose

Put the API, its database, and the web app on real hosts, through a deploy that needs no manual step — so that from here on, merging to `main` is what ships.

## Responsibilities

- The Supabase Postgres database in Mumbai, with its backup and recovery terms on the chosen plan recorded.
- The API running as one always-on container on a host with a Mumbai region, chosen and recorded here, deployed from `main`.
- Until `main` first carries the deploy configuration, the deploy is proven from this module's branch by a manually triggered run. After that, only `main` deploys.
- Migrations applied by the deploy itself, before the new API version takes traffic.
- The web export served from a static host, deployed from `main`.
- Every secret held in the hosts' or CI's secret stores; `.env.example` complete and holding no real value.
- A deploy section in the README: what triggers a deploy, how to roll back to an earlier version.
- The API host and static web host choices recorded in the decisions file, closing the open rows in [STACK.md](../../product/STACK.md) §13.

## Interface

- **The deployed API URL** and **the deployed web URL**, recorded in the README.
- **The deploy trigger:** a merge to `main` that passed CI.
- **Rollback:** redeploy an earlier commit or tag; never a database rollback ([PRODUCT_ROADMAP.md](../../product/PRODUCT_ROADMAP.md) §Rollback).

## Acceptance criteria

- `GET /health` at the deployed URL reports the database reachable.
- The first migration reached the managed database through the deploy, not by hand.
- Deploying the same commit twice changes nothing.
- The web export is reachable at its deployed URL and shows the wiring screen.
- A search of the repository and of the built web bundle finds no secret.
- A deploy does not run when CI fails.

## Out of scope

- Production domains, `app.<domain>` and `api.<domain>` (Phase 5).
- Store submission and EAS Update channels (Phase 5).
- Sentry and the uptime check (Phase 5).

## Needs from the product owner

- Approval of the API host and static web host this module proposes, then accounts on them.
- The Supabase database URL added to the API host's secret store.
