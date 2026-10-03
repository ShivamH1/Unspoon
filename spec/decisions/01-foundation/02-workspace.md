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
