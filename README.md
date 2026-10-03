# Unspoon

A quit-sugar app. It pairs a streak that tells the story of sugar withdrawal day by day with a scanner that answers one question — "how much sugar is in this?" — in teaspoons, not grams.

One Expo app for iOS, Android, and web, backed by a Fastify API on Postgres.

## Status

Specification stage. There is no application code yet; the first story being built is the foundation.

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
- one branch per module, named after the module, cut from `development`
