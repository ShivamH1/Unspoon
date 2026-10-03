# Decisions 01.01 — Version pins

> **Module:** [01.01 — Version pins](../../modules/01-foundation/01-version-pins.md) · **Plan:** [01.01](../../plan/01-foundation/01-version-pins.md)
> **Checked on:** 2026-10-03, against the npm registry, `nodejs.org`, and the Maestro releases page.

This file is the single source of versions. Every later module installs what is listed here; none chooses a version of its own.

## Method

A version is recorded only when both of these hold.

**It is stable.**
- It carries no pre-release suffix (`-alpha`, `-beta`, `-rc`, `-canary`, `-dev`, `-next`).
- It is what the registry's `latest` tag points to, or, for a package Expo manages, the version the chosen Expo SDK prescribes.
- The vendor does not label it beta, preview, or experimental.

**It is compatible.**
- Its declared `peerDependencies` and `engines` accept the other pins in this file.

Each claim can be re-checked with two read-only commands, which install nothing:

```
npm view <package> dist-tags
npm view <package>@<version> peerDependencies engines
```

The versions an Expo SDK prescribes come from the `bundledNativeModules.json` file shipped inside the `expo` package at that version. It is the table `npx expo install` reads.

## 1. Expo SDK

**Chosen: Expo SDK 57** — `expo` 57.0.26, the version the registry's `latest` tag points to.

| SDK | Registry status | `@clerk/expo` 4.8.0 | `react-native-purchases` 10.11.0 | `@sentry/react-native` |
|---|---|---|---|---|
| 58 | Not released as stable: published under the `next` tag (58.0.3) | Excluded — peer range is `expo >=54 <58` | Accepted | Accepted |
| **57** | **Stable: `latest` → 57.0.26** | **Accepted** | **Accepted** — needs `react-native >=0.73.0` | **Accepted** — needs `expo >=49.0.0` |
| 56 and older | Stable, superseded | Accepted down to 54 | Accepted | Accepted |

**Nothing constrained the choice.** The newest stable SDK is supported by all three native dependencies, so the risk the plan named — being forced onto an old SDK — did not occur.

**Clerk will constrain the next upgrade.** Its peer range stops below SDK 58. Moving to SDK 58 waits for a Clerk release that widens it.

**Clerk's compatibility article was out of date.** It covers SDK 54 and 55, which is why [STACK.md](../../product/STACK.md) §14 listed this as a risk. The package's declared peer range is the stronger evidence and is what this decision rests on.

SDK 57 brings:

| Package | Version |
|---|---|
| `react-native` | 0.86.3 |
| `react` | 19.2.3 |
| `react-dom` | 19.2.3 |
| `react-native-web` | ~0.21.0 (newest patch 0.21.3) |

## 2. App dependencies

"SDK 57" in the Source column means the version Expo SDK 57 prescribes. Those rows are installed with `npx expo install`, which writes the same range. Everything else is the registry's `latest`, unless the row says otherwise.

| Package | Version | Source | Compatibility evidence | First installed |
|---|---|---|---|---|
| `expo` | 57.0.26 | `latest` | — | Phase 0 |
| `react` | 19.2.3 | SDK 57 — npm `latest` is 19.3.0; the SDK's pin wins | — | Phase 0 |
| `react-dom` | 19.2.3 | SDK 57 | — | Phase 0 |
| `react-native` | 0.86.3 | SDK 57 | Node `^24.3.0` accepted | Phase 0 |
| `react-native-web` | ~0.21.0 | SDK 57 | — | Phase 0 |
| `expo-router` | ~57.0.24 | SDK 57 | Its own peers resolve through `npx expo install` | Phase 0 |
| `@expo/metro-runtime` | ~57.0.16 | SDK 57 | Required by Expo Router | Phase 0 |
| `expo-dev-client` | ~57.0.19 | SDK 57 | — | Phase 0 |
| `@types/react` | ~19.2.2 | Expo's SDK 57 template | — | Phase 0 |
| `jest-expo` | ~57.0.5 | SDK 57 | Built on Jest 29 | Phase 0 |
| `jest` | 29.7.0 | Newest 29.x — npm `latest` is 30.5.2; see §4 | Matches `jest-expo` | Phase 0 |
| `@testing-library/react-native` | 14.0.1 | `latest` | Needs `jest >=29`, `react >=19`, `react-native >=0.78`, `test-renderer ^1` | Phase 0 |
| `test-renderer` | 1.3.0 | `latest` | Needs `react ^19` | Phase 0 |
| `expo-sqlite` | ~57.0.3 | SDK 57 | iOS and Android only ([STACK.md](../../product/STACK.md) §6) | Phase 1 |
| `zustand` | 5.0.15 | `latest` | Needs `react >=18` | Phase 1 |
| `expo-secure-store` | ~57.0.4 | SDK 57 | Clerk needs `>=12.4.0` | Phase 2 |
| `@clerk/expo` | 4.8.0 | `latest` | `expo >=54 <58`, `react-native >=0.75`, `react ^18 \|\| ^19` | Phase 2 |
| `react-native-purchases` | 10.11.0 | `latest` | `react-native >=0.73.0` | Phase 2 |
| `expo-camera` | ~57.0.6 | SDK 57 | — | Phase 3 |
| `expo-image-picker` | ~57.0.20 | SDK 57 | — | Phase 3 |
| `expo-image-manipulator` | ~57.0.20 | SDK 57 | — | Phase 3 |
| `expo-sharing` | ~57.0.22 | SDK 57 | — | Phase 3 |
| `react-native-view-shot` | 5.1.0 | SDK 57 — npm `latest` is 6.1.0 | Needs `react-native >=0.76.0` | Phase 3 |
| `expo-notifications` | ~57.0.21 | SDK 57 | — | Phase 4 |
| `expo-updates` | ~57.0.24 | SDK 57 | — | Phase 5 |
| `@sentry/react-native` | ~7.11.0 | SDK 57 — npm `latest` is 8.29.0; see §4 | Needs `expo >=49.0.0` | Phase 5 |
| `posthog-react-native` | 4.78.4 | `latest` | All Expo peers optional | Phase 5 |

Tools that are run, not depended on:

| Tool | Version | Source | First used |
|---|---|---|---|
| `eas-cli` | 24.10.0 | `latest` | Phase 0 |
| Maestro CLI | 2.11.0 | Latest GitHub release, not marked pre-release | First device flow |

## 3. Server and tooling

| Package | Version | Source | Compatibility evidence | First installed |
|---|---|---|---|---|
| Node.js | 24.21.0 | Newest LTS line ("Krypton") on `nodejs.org`. Node 26 is the "Current" line, not yet LTS | Accepted by every `engines` range in this file (§4) | Phase 0 |
| `pnpm` | 12.8.1 | `latest` | Node `>=18` | Phase 0 |
| `typescript` | 6.0.3 | Expo's SDK 57 template (`~6.0.3`) — npm `latest` is 7.0.2; see §4 | Prisma needs `>=5.4.0` | Phase 0 |
| `@types/node` | 24.19.1 | Newest 24.x | Matches Node 24 | Phase 0 |
| `@biomejs/biome` | 2.5.15 | `latest` | Node `>=14.21.3` | Phase 0 |
| `zod` | 4.6.5 | `latest` | `openai` accepts `^3.25 \|\| ^4.0` | Phase 0 |
| `vitest` | 5.0.3 | `latest` | Node `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` | Phase 0 |
| `fastify` | 5.12.5 | `latest` — `next` is 6.0.0-alpha.4 | — | Phase 0 |
| `prisma` | 7.10.0 | **Not `latest`**: that tag points to 8.0.0-rc.19, a release candidate. 7.10.0 is the newest stable, under the `prev` tag; see §4 | Node `^20.19 \|\| ^22.12 \|\| >=24.0` | Phase 0 |
| `@prisma/client` | 7.10.0 | `latest` | `typescript >=5.4.0`; same Node range | Phase 0 |
| `@prisma/adapter-pg` | 7.10.0 | `latest` | Depends on `pg ^8.16.3` | Phase 0, if module 05 confirms Prisma 7 needs a driver adapter |
| `pg` | 8.23.1 | `latest` | Node `>=16` | With the adapter |
| `@fastify/cors` | 11.3.0 | `latest` | — | Phase 2 |
| `@clerk/fastify` | 3.1.85 | `latest` | `fastify >=5`, Node `>=20.9.0` | Phase 2 |
| `openai` | 7.27.0 | `latest` | `zod ^3.25 \|\| ^4.0`, Node `>=22.0.0` | Phase 3 |
| `pg-boss` | 12.36.0 | `latest` | Node `>=22.12.0` | Phase 4 |
| `@sentry/node` | 11.4.0 | `latest` | — | Phase 5 |

## 4. Cross-checks

Each check compares one pin against the ranges the other pins declare.

| # | Check | Result |
|---|---|---|
| 1 | **One React version.** 19.2.3 against `@clerk/expo` (`^18 \|\| ^19`), `zustand` (`>=18`), `@testing-library/react-native` (`>=19`), `test-renderer` (`^19`), and `jest-expo`'s bundled `react-test-renderer` (19.2.3) | Pass |
| 2 | **Expo version.** 57.0.26 against `@clerk/expo` (`>=54 <58`) and `@sentry/react-native` (`>=49`) | Pass |
| 3 | **React Native version.** 0.86.3 against `@clerk/expo` (`>=0.75`), `react-native-purchases` (`>=0.73.0`), `react-native-view-shot` 5.1.0 (`>=0.76.0`), `@testing-library/react-native` (`>=0.78`) | Pass |
| 4 | **Node version.** 24.21.0 against `react-native` (`^24.3.0`), `vitest` (`^24.0.0`), `prisma` and `@prisma/client` (`>=24.0`), `pg-boss` (`>=22.12.0`), `openai` (`>=22.0.0`), `@clerk/fastify` and `@clerk/expo` (`>=20.9.0`), `@testing-library/react-native` (`>=24`), `jest` 29.7.0 (`>=18.0.0`), `pnpm` (`>=18`) | Pass |
| 5 | **TypeScript version.** Expo's SDK 57 template pins `~6.0.3`; `@prisma/client` needs `>=5.4.0` | Conflict with npm `latest` — resolved below |
| 6 | **Zod version.** 4.6.5 against `openai` (`^3.25 \|\| ^4.0`) | Pass |
| 7 | **Jest version.** `jest-expo` 57.0.5 depends on the Jest 29 packages (`^29.2.1`); `@testing-library/react-native` needs `>=29` | Conflict with npm `latest` — resolved below |
| 8 | **Fastify version.** 5.12.5 against `@clerk/fastify` (`>=5`) | Pass |
| 9 | **Prisma set.** CLI, client, and adapter all at 7.10.0; the adapter's `pg ^8.16.3` against `pg` 8.23.1 | Pass, once the CLI is pinned off `latest` — resolved below |
| 10 | **Packages Expo manages.** The SDK 57 prescription against npm `latest` for `@sentry/react-native` and `react-native-view-shot` | Conflict with npm `latest` — resolved below |

**Conflicts and how each was resolved.** In every case the registry's `latest` tag was not the right answer:

- **TypeScript: 6.0.3, not 7.0.2.** TypeScript 7 is stable, but Expo SDK 57 is built and templated against 6.0. The repo uses one TypeScript version, so the app's constraint decides it. Moving to 7 is its own change, after Expo supports it.
- **Prisma CLI: 7.10.0, not 8.0.0-rc.19.** The `latest` tag on the `prisma` package points to a release candidate, while `@prisma/client`'s `latest` is 7.10.0. A plain `pnpm add prisma` would install a pre-release and a CLI one major version ahead of its client. Always install `prisma@7.10.0` explicitly.
- **Jest: 29.7.0, not 30.5.2.** `jest-expo` for SDK 57 is built on Jest 29. Jest 30 beside it would put two Jest majors in one test run.
- **React: 19.2.3, not 19.3.0.** The SDK pins React exactly, and React Native 0.86.3 is built against it.
- **`@sentry/react-native`: ~7.11.0, not 8.29.0.** Version 8 declares support for Expo 49 and later, but SDK 57 prescribes the 7.11 line, and `npx expo install` and `expo-doctor` both enforce the prescription. It is not installed until Phase 5; re-check then, because Expo may move its prescription within SDK 57's lifetime.
- **`react-native-view-shot`: 5.1.0, not 6.1.0.** Same reason: the SDK prescribes it.

**Not checkable without installing** — each is left to the module that first installs it:

- pnpm 12 with Expo's Metro bundler resolving workspace packages (module 06).
- Whether Prisma 7's client needs the `pg` driver adapter in this setup (module 05).
- `@clerk/fastify` accepting a Bearer token from the native app (Phase 2).

## 5. Decisions and learnings
