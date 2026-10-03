# Unspoon

A quit-sugar app, built spec-first. `spec/product/` is the source of truth; this file points into it.

## Read before any work

- `spec/product/PRODUCT_CONTEXT.md` — what the product is and its boundaries. Read it first, every session.
- `spec/product/STACK.md` — what to build with. Read it before adding or choosing any dependency or service.
- `spec/product/PRODUCT_ROADMAP.md` — the active phase and its exit criteria. Read §Spec Workflow, Commits & Versioning before writing a story, module, plan, or decisions file, and before any branch or commit.

## How work moves

Story → module → plan → code → decisions. Each stage is a file under `spec/`, and the product owner approves each stage before the next one starts. Code for a module starts when its plan is agreed.

The module is the unit of work: one module, one branch named after the module and cut from `development`, one plan, one decisions file.

## Rules that hold on every change

- Build the active phase only, one module at a time.
- Install the versions recorded in `spec/decisions/01-foundation/01-version-pins.md`; every dependency is a stable release.
- When the code and the spec disagree, fix the spec in the same change, as its own `docs:` commit.
- A commit message ends where the message ends: no co-author line and no tool attribution.
- Supabase is the Postgres host only. The repo holds its connection URL and no Supabase package.
- This is a clean rebuild. Build from this repo's spec alone; the earlier repo at `../sugar-quit` is not a reference.
