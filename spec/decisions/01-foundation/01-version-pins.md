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

## 4. Cross-checks

## 5. Decisions and learnings
