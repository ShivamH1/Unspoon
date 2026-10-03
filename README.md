# Unspoon

A quit-sugar app. It pairs a streak that tells the story of sugar withdrawal day by day with a scanner that answers one question — "how much sugar is in this?" — in teaspoons, not grams.

One Expo app for iOS, Android, and web, backed by a Fastify API on Postgres.

## Status

Foundation in progress. The workspace and its tooling exist; there is no app or API code yet.

## Setup

You need Node 24 (the version in `.node-version`) and pnpm 12.8.1. The steps below get both without installing pnpm by hand.

1. Install a Node version manager that reads `.node-version`, for example [fnm](https://github.com/Schniz/fnm): `brew install fnm`.
2. In this folder, install and select the pinned Node: `fnm install && fnm use`.
3. Turn on Corepack, which ships with Node 24 and supplies the pinned pnpm: `corepack enable`.
4. Install dependencies: `pnpm install`.

Installing under any other Node major fails with `ERR_PNPM_UNSUPPORTED_ENGINE`.

Secrets and environment variables live in a local `.env`, which git ignores. Copy `.env.example` to `.env` to start; `.env.example` is the list of every variable and never holds a real value.

## Commands

Run from the repo root.

| Command | What it does |
|---|---|
| `pnpm check` | Every quality gate, in order: Node version, lint, typecheck, test. This is what CI runs |
| `pnpm lint` | Lint, format, and import-order check with Biome. Changes nothing |
| `pnpm format` | Applies Biome's safe fixes |
| `pnpm typecheck` | Runs `typecheck` in every workspace package that defines it |
| `pnpm test` | Runs `test` in every workspace package that defines it |

## How this repo works

Development is spec-driven. Every stage is a file under `spec/`, written from the one before it:

| Folder | Holds |
|---|---|
| [`spec/product/`](spec/product/) | What we are building, when, and with what |
| `spec/stories/` | One slice of the product per story |
| `spec/modules/` | The buildable units each story breaks into |
| `spec/plan/` | The implementation plan for one module |
| `spec/decisions/` | What was decided while building one module, and why |

Start with the three files in `spec/product/`:

- [`PRODUCT_CONTEXT.md`](spec/product/PRODUCT_CONTEXT.md) — what and why
- [`PRODUCT_ROADMAP.md`](spec/product/PRODUCT_ROADMAP.md) — phases, workflow, commit and branch rules
- [`STACK.md`](spec/product/STACK.md) — the technology choices

## Branches

- `main` — released history
- `development` — integration branch
- `feature/<module-name>` — one branch per module, cut from `development`
- `fixed/<bug-name>` — one branch per bug, cut from `development`
