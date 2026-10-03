# Module 01.05 — API

> **Story:** [01 — Foundation](../../stories/01-foundation.md) · **Covers:** S01-AC3, S01-AC4, S01-AC5 (each in part) · **Depends on:** 01.02, 01.03, 01.04
> **Status:** Approved 2026-10-03.

## Purpose

A running Fastify service with a database behind it and nothing else: the smallest API that later stories can add routes to.

## Responsibilities

- `apps/api`: Fastify with `GET /health`. The handler runs a trivial database query and returns a response validated by the health schema from `packages/core`.
- Prisma, with the schema and migrations in `apps/api/prisma` ([STACK.md](../../product/STACK.md) §5).
- A `users` table whose primary key is the Clerk user id, plus a created-at timestamp. Nothing reads or writes it yet.
- The first migration, and the one command that applies migrations, for the deploy to call.
- `DATABASE_URL` holding a Supabase Postgres connection string, non-pooled, and nothing else from Supabase: no `@supabase/*` package is installed ([STACK.md](../../product/STACK.md) §5).
- CI runs against a plain Postgres container. Local development uses a local Postgres or a separate Supabase development database, documented in the README. No test ever touches a hosted database.
- Two new gates in the root `check` script: a production build of the API, and the no-persistence greps from [STACK.md](../../product/STACK.md) §7.
- API tests in Vitest, with CI providing a Postgres container.

## Interface

- **`GET /health`** → `{ status, database }` as defined by the schema in `packages/core`.
- **Environment:** `DATABASE_URL`, `PORT`. Listed in `.env.example`.
- **The migrate command** used by 01.07.

## Acceptance criteria

- `GET /health` reports the database reachable when it is, and unreachable (without crashing) when it is not.
- The API imports its response schema from `packages/core`.
- The first migration applies to an empty database, and applying it twice changes nothing.
- A planted violation — a filesystem write under `apps/api/src` — makes the no-persistence gate fail in CI.
- The API builds for production in CI.
- The lockfile contains no `@supabase/*` package.

## Out of scope

- Clerk, `requireUser`, and any authenticated route (Phase 2).
- Repository helpers; there is no user-scoped query yet.
- pg-boss and any job (Phase 4).
- Deployment (01.07).

## Needs from the product owner

- The Supabase database URL, placed in a local `.env`. It is never committed and never pasted into a chat.
