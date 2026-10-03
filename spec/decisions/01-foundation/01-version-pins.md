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

## 3. Server and tooling

## 4. Cross-checks

## 5. Decisions and learnings
