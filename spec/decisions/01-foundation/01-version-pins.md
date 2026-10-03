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

## 2. App dependencies

## 3. Server and tooling

## 4. Cross-checks

## 5. Decisions and learnings
