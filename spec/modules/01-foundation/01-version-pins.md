# Module 01.01 — Version pins

> **Story:** [01 — Foundation](../../stories/01-foundation.md) · **Covers:** S01-AC9 · **Depends on:** nothing
> **Status:** Built 2026-10-03 on branch `version-pins`; awaiting merge to `development`.

## Purpose

Decide the exact, stable version of everything the product will install, before anything is installed. This is research, not code: its output is a table every later module installs from.

## Responsibilities

- Find the newest Expo SDK that `@clerk/expo`, `react-native-purchases`, and `@sentry/react-native` all support at a stable release, and the React Native and React versions that SDK brings.
- Choose the latest stable version of every other dependency named in [STACK.md](../../product/STACK.md) §2–§10: Node, pnpm, TypeScript, Biome, Zod, Vitest, jest-expo, Fastify, `@clerk/fastify`, Prisma, pg-boss, `openai`, Zustand, and the Expo modules.
- For each one, record the evidence: the vendor page or release note that shows it is a stable release and, for native dependencies, that it supports the chosen SDK.
- Stop and report if any dependency has no stable release compatible with the others.

## Interface

- The version table in `spec/decisions/01-foundation/01-version-pins.md`. No later module chooses a version; it reads this table.
- [STACK.md](../../product/STACK.md) §6 updated to name the chosen Expo SDK.

## Acceptance criteria

- Every dependency in STACK §2–§10 has a row: name, exact version, evidence of stable status, evidence of compatibility.
- No row is an alpha, beta, release candidate, canary, or preview.
- The Expo SDK choice states which dependency constrained it.
- Any conflict is raised to the product owner rather than resolved by taking a pre-release.

## Out of scope

- Installing anything. Dependencies that later phases use are pinned here and installed in the phase that needs them.
