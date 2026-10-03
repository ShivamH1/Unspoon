# Module 01.02 — Workspace

> **Story:** [01 — Foundation](../../stories/01-foundation.md) · **Covers:** S01-AC1, S01-AC10 (in part) · **Depends on:** 01.01
> **Status:** Built 2026-10-03 on branch `feature/workspace`; awaiting review and merge to `development`.

## Purpose

The empty monorepo every other module lives in: one install, one set of commands, one set of rules.

## Responsibilities

- pnpm workspace with `apps/` and `packages/`, the pinned Node and pnpm versions enforced so a wrong version fails fast.
- A strict base TypeScript config that every package extends.
- Biome configured for lint and format.
- Root scripts: `lint`, `typecheck`, `test`, and `check`, where `check` runs every quality gate in order.
- `.gitignore` covering dependencies, build output, env files, and OS files such as `.DS_Store`.
- `.env.example` as the single list of environment variables, with no real value in it.
- The existing README extended with every command a developer needs.

## Interface

- **Root script names.** CI and every later module call these; a later module adds a gate by extending a script, not by inventing a command.
- **The base TypeScript config** that packages extend.
- **The directory layout** from [STACK.md](../../product/STACK.md) §2.

## Acceptance criteria

- On a clean clone with the pinned Node and pnpm, `pnpm install` then `pnpm check` succeeds.
- A lint error and a type error each make `pnpm check` fail.
- `.DS_Store` and env files cannot be committed by accident.
- The README's commands are exactly the ones that exist.

## Out of scope

- Any package or app; they arrive in 01.03, 01.05, and 01.06.
- CI configuration (01.04).
