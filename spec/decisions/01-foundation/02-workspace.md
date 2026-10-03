# Decisions 01.02 — Workspace

> **Module:** [01.02 — Workspace](../../modules/01-foundation/02-workspace.md) · **Plan:** [01.02](../../plan/01-foundation/02-workspace.md)

Decisions are added here as they are made, one commit each.

## Machine setup

Done on 2026-10-03, with the product owner's go-ahead. It changed the machine, not the repo.

- **fnm 1.39.0**, installed with Homebrew, manages Node per folder. Homebrew's own Node 26 is untouched.
- **Node 24.21.0**, installed through fnm.
- **Corepack 0.36.0**, which ships with Node 24, supplies pnpm. It reads the `packageManager` field and provides exactly that version, so pnpm is never installed by hand.

One line in `~/.zshrc` makes fnm switch automatically on entering the folder. It is left to the product owner:

```
eval "$(fnm env --use-on-cd --shell zsh)"
```

## 1. How the Node and pnpm pins are enforced

| Mechanism | Value | What it does |
|---|---|---|
| `.node-version` | `24.21.0` | fnm and similar managers switch to this version in the folder |
| `engines.node` in `package.json` | `>=24.21.0 <25` | pnpm refuses to install under any other Node major |
| `packageManager` in `package.json` | `pnpm@12.8.1` | Corepack provides exactly this pnpm |
| `engines.pnpm` in `package.json` | `12.8.1` | pnpm refuses to run as any other version |
| `engineStrict` in `pnpm-workspace.yaml` | `true` | The same check applies to dependencies |

**The Node range allows newer 24.x releases and nothing else.** Patches of the LTS line are safe to take; Node 25 and 26 are not LTS and are rejected.

**pnpm 12 reads its settings from `pnpm-workspace.yaml`.** `.npmrc` now carries only registry and auth settings, so the repo has no `.npmrc`. Confirmed with `pnpm config get engineStrict`, which returns `true`.

**What a developer on the wrong Node sees**, from a fresh install under Node 26.7.0, exit code 1:

```
Error: ERR_PNPM_UNSUPPORTED_ENGINE
  × Unsupported engine for …/Unspoon:
  │ wanted: {"node":">=24.21.0 <25"} (current: {"node":"26.7.0"})
```

**A gap in that check.** When dependencies are already installed and nothing has changed, `pnpm install` under the wrong Node prints "Already up to date" and exits 0: pnpm skips the engine check on that path. A fresh clone is always checked, which is the case that matters most. Step 5 decides whether `pnpm check` needs its own guard.

**New commit scope: `repo`.** Root-level tooling belongs to none of `core`, `content`, `api`, `app`, or `spec`. The roadmap's scope list gains `repo` for it.

## 2. What git ignores

- **Every `.env` file is ignored, at any depth; only `.env.example` is tracked.** The rule is written as "ignore `.env` and `.env.*`, then un-ignore `.env.example`", so a new variant such as `.env.staging` is covered without anyone remembering to add it.
- **Signing credentials are ignored by extension** (`.jks`, `.keystore`, `.p8`, `.p12`, `.mobileprovision`). They are secrets that tools tend to drop into the project folder.
- **Native `ios/` and `android/` folders are not decided here.** Whether they are generated or committed is the app module's decision (01.06), which adds its own rule.
- **`.env.example` lists no variable yet.** No module has introduced one. Each module that does adds its variable there, with a comment naming the app that reads it.

Checked with `git check-ignore`: `.env`, `.env.local`, `.env.production`, `apps/app/.env`, `.DS_Store`, and `node_modules/` are ignored; `.env.example`, `package.json`, and source files are not.

## 3. TypeScript

**The base config holds strictness and hygiene only.** `module`, `target`, `lib`, and JSX settings are left to each package, because the three consumers differ: the app is bundled by Metro and extends Expo's own config, the API runs on Node, and the shared packages are read by both. A base that set those would be wrong for at least one of them.

| Flag | Why it is on |
|---|---|
| `strict` | The baseline; stated even though TypeScript 6 defaults to it, so the intent survives a default changing |
| `noUncheckedIndexedAccess` | Reading `array[i]` or `record[key]` yields `T \| undefined`. The streak engine walks a day log by index and by date key; this makes a missing day a compile error instead of a runtime one |
| `noImplicitOverride` | An overriding method must say so |
| `noImplicitReturns` | Every code path in a function returns |
| `noFallthroughCasesInSwitch` | A `switch` case cannot fall into the next by accident |
| `isolatedModules` | Each file must be compilable alone, which Metro, Babel, and Vitest all require |
| `skipLibCheck` | Dependencies' own type files are not re-checked; only our code is |

**Left off on purpose:**

- **`exactOptionalPropertyTypes`.** It treats "missing" and "explicitly `undefined`" as different, which is correct but collides with how Zod, Prisma, and React Native type their optional fields. The friction lands on every boundary with a library. It can be turned on per package later if a package wants it.
- **`noUnusedLocals` and `noUnusedParameters`.** Biome reports unused code, with better messages and an auto-fix. Two tools reporting the same thing is noise.
- **`verbatimModuleSyntax`.** Its right value depends on each package's module format, so it is a per-package setting.

**The root `typecheck` script runs each package's own `typecheck`** (`pnpm -r --if-present run typecheck`). There is no root-level `tsc` run: TypeScript errors when given no input files, and each package needs its own settings anyway. On the empty workspace the script reports "No projects matched" and exits 0.

## 4. Biome

- **The config is Biome's own generated default for 2.5.15, kept as generated.** It turns on the recommended lint rules, the formatter, import sorting, and git-ignore awareness, so anything `.gitignore` excludes is skipped without a second list to maintain. Starting from the default means every later deviation is a visible, deliberate edit.
- **Tabs for indentation, double quotes in JavaScript and TypeScript.** Both are Biome's defaults. No style rule here is worth an argument, so the defaults stand.
- **`lint` checks; `format` fixes.** `pnpm lint` is `biome check .`: it reports lint, format, and import-order problems and changes nothing, which is what a gate must do. `pnpm format` is `biome check --write .` and applies the safe fixes.
- **`spec/` needs no exclusion.** It holds only Markdown, which Biome does not process. If a JSON or TypeScript file ever lands there, Biome will check it like any other.

On the repo as it stands, `pnpm lint` checks three files (`package.json`, `tsconfig.base.json`, `biome.json`) and passes.

## 5. One command for every gate

**`pnpm check` runs the Node guard, then lint, then typecheck, then test, and stops at the first failure.** CI will run this one command and nothing else, so a gate added later by extending these scripts reaches CI without touching the workflow.

**`test` and `typecheck` fan out to the packages.** Each runs the script of the same name in every workspace package that has one. A package joins a gate by defining the script; the root never lists packages.

**A Node guard was added, closing the gap from §1.** Testing showed pnpm checks the Node version on a fresh install but not when it runs a script: with dependencies already installed, `pnpm check` ran to completion under Node 26. `scripts/check-node.mjs` now runs first. It reads `.node-version`, so the pin still lives in one place, and it has no dependencies. Under Node 26.7.0 `pnpm check` exits 1 with:

```
Unspoon needs Node 24.x at 24.21.0 or newer, and this is Node 26.7.0.
Switch to the version in .node-version, then run the command again.
```

**The gates were seen to fail.** Each plant was temporary and was never committed.

| Plant | Result |
|---|---|
| A root file with an unused variable and a `debugger` statement | `pnpm check` exits 1 at lint: `lint/suspicious/noDebugger` |
| A temporary package with `const count: number = "three"` | `pnpm check` exits 1 at typecheck: `error TS2322: Type 'string' is not assignable to type 'number'` |
| The same package reading `days[0]` from a `number[]` into a `number` | `pnpm check` exits 1: `Type 'number \| undefined' is not assignable to type 'number'` — the base config's `noUncheckedIndexedAccess` reaches a package that extends it |
| The same package with valid code | `pnpm check` exits 0 |

The temporary package also showed that a workspace package's `typecheck` script finds the root's `tsc` without installing TypeScript again.

**The test gate cannot be seen to fail yet.** No package has a test runner until module 03 adds Vitest, so its red run is recorded there.
