# Plan 01.02 — Workspace

> **Module:** [01.02 — Workspace](../../modules/01-foundation/02-workspace.md) · **Branch:** `feature/workspace` · **Commit prefix:** `S01.M02`
> **Status:** Approved 2026-10-03, including the machine setup; all six steps complete.

## Approach

Build the empty monorepo in the order a new developer meets it: the right Node and pnpm, what git ignores, then TypeScript, then Biome, then the one command that runs every gate. Nothing in `apps/` or `packages/` is created here; the folders arrive with their first occupant in modules 03, 05, and 06.

Every version comes from [the version pins](../../decisions/01-foundation/01-version-pins.md), and every install names its version.

## Before step 1 — machine setup, needs the product owner's go-ahead

This machine has Node 26.7.0 from Homebrew and no pnpm, no Corepack, and no Node version manager. The module cannot be built or verified without the pinned Node 24.21.0 and pnpm 12.8.1. Proposed setup, which changes the machine and not the repo:

1. `brew install fnm` — a Node version manager that reads the repo's `.node-version` file and switches per folder. Homebrew's Node 26 stays in place for everything else.
2. `fnm install 24.21.0`.
3. `corepack enable` under Node 24, which ships Corepack. Corepack then provides exactly the pnpm version named in the repo's `packageManager` field.

fnm also needs one line added to `~/.zshrc` to switch automatically. That edit is the product owner's to make or approve.

## Steps

Each step is at least one commit and usually several: a configuration change, its check, and any decision it forces are committed separately and share the step's id. A step's checkbox is ticked in the commit that completes it. Decisions go into `spec/decisions/01-foundation/02-workspace.md` as they are made, each in its own commit.

- [x] **1. Pin Node and pnpm.** Add `.node-version` (24.21.0), a private root `package.json` with `packageManager: pnpm@12.8.1` and `engines` for Node and pnpm, and `pnpm-workspace.yaml` listing `apps/*` and `packages/*` with engine checks strict. Confirm the exact setting names against pnpm 12.8.1 when writing them.
  - *Check:* `pnpm install` succeeds under Node 24.21.0 and fails with a clear message under Node 26.
- [x] **2. Ignore rules and the env list.** Add `.gitignore` covering dependencies, build output, Expo and test caches, logs, OS files such as `.DS_Store`, and every `.env*` file except `.env.example`. Add `.env.example` with a header explaining the rule; it lists no variable yet, because no module has introduced one.
  - *Check:* `git check-ignore` confirms `.env`, `.env.local`, and `.DS_Store` are ignored and `.env.example` is not.
- [x] **3. TypeScript.** Install `typescript@6.0.3` and `@types/node@24.19.1` at the root. Add `tsconfig.base.json` with `strict` and the stricter flags recorded in the decisions file. Add the root `typecheck` script, which runs each workspace package's own `typecheck`.
  - *Check:* `pnpm typecheck` passes on the empty workspace.
- [x] **4. Biome.** Install `@biomejs/biome@2.5.15` at the root. Add `biome.json` with the recommended lint rules, the formatter, and git-ignore awareness. Add the root `lint` and `format` scripts.
  - *Check:* `pnpm lint` passes on the repo as it stands.
- [x] **5. One command for every gate.** Add the root `test` script, which runs each workspace package's own `test`, and the root `check` script, which runs lint, then typecheck, then test, and stops at the first failure.
  - *Check:* a planted lint error makes `pnpm check` fail; a planted type error in a temporary workspace package makes it fail. Neither plant is committed; both results are recorded in the decisions file.
- [x] **6. README, decisions, and the clean-clone proof.** Extend the README with the setup steps and the commands. Complete the decisions file. Clone the branch into an empty folder, then run `pnpm install` and `pnpm check` there.
  - *Check:* the clean clone passes with only the documented steps, and every command in the README exists.

## Files touched

| File | Step |
|---|---|
| `.node-version`, `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` | 1 |
| `.gitignore`, `.env.example` | 2 |
| `tsconfig.base.json`, `package.json`, `pnpm-lock.yaml` | 3 |
| `biome.json`, `package.json`, `pnpm-lock.yaml` | 4 |
| `package.json` | 5 |
| `README.md`, `spec/decisions/01-foundation/02-workspace.md` | 6 |
| `spec/plan/01-foundation/02-workspace.md` | every step, checkbox only |

## Decisions this module will record

- Which strictness flags `tsconfig.base.json` sets beyond `strict`, and why each.
- How the Node and pnpm pins are enforced, and what a developer sees when they are wrong.
- Whether Biome formats the Markdown-free parts of `spec/` or leaves that folder alone.

## Risks

- **pnpm 12's setting names differ from what older guides show.** Settings other than registry and auth now live in `pnpm-workspace.yaml`, not `.npmrc`. Step 1 confirms each name against pnpm 12.8.1 itself before relying on it.
- **Corepack is not bundled with Node 25 and later.** A developer on a newer Node would get no pnpm at all, which is one more reason the Node pin is enforced first.
- **An empty workspace makes "typecheck passes" a weak claim.** That is why step 5 plants a real type error in a temporary package rather than trusting a green run.

## Verification

The module is done when its four acceptance criteria hold:

1. On a clean clone with the pinned Node and pnpm, `pnpm install` then `pnpm check` succeeds.
2. A lint error and a type error each make `pnpm check` fail.
3. `.DS_Store` and env files cannot be committed by accident.
4. The README's commands are exactly the ones that exist.
