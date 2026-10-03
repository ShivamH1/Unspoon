# Module 01.03 — Shared packages

> **Story:** [01 — Foundation](../../stories/01-foundation.md) · **Covers:** S01-AC3 (in part), S01-AC5 (in part) · **Depends on:** 01.02
> **Status:** Approved 2026-10-03.

## Purpose

Create `packages/core` and `packages/content` with a small amount of real, tested code, so the app and the API have something genuine to share and the wiring is proven before features depend on it.

## Responsibilities

**`packages/core`** — pure TypeScript, no platform imports.
- `localDateOf(instant, timeZone)`: the calendar date a moment falls on in a given time zone. Every later phase keys its data by local date, so this is the seed of the streak engine, not a placeholder.
- The Zod schema for the `GET /health` response, as the first shared API contract.
- Unit tests, including a midnight boundary and a time-zone difference.

**`packages/content`** — validated JSON.
- One content file holding the app's name and tagline, with its Zod schema.
- A validation command that fails when any content file does not match its schema.

## Interface

- `packages/core` exports `localDateOf` and the health schema. It imports nothing from React, React Native, Node-only modules, or Prisma.
- `packages/content` exports typed, already-validated content. Consumers never parse JSON themselves.
- The content validation command, wired into the root `check` script.

## Acceptance criteria

- `packages/core` tests pass and cover the midnight and time-zone cases.
- A content file that breaks its schema makes `pnpm check` fail.
- Both packages typecheck under the base config and can be imported by another workspace package.

## Out of scope

- The streak engine, the day log, and any other domain logic (Phase 1).
- Timeline, quiz, checklist, or SOS content (later phases).

## Note

`localDateOf` is a deliberate, minimal reach into Phase 1. The alternative was a throwaway function deleted in the next story; a real one that stays is the smaller cost.
