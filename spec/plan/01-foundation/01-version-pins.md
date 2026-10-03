# Plan 01.01 — Version pins

> **Module:** [01.01 — Version pins](../../modules/01-foundation/01-version-pins.md) · **Branch:** `version-pins` · **Commit prefix:** `S01.M01`
> **Status:** Approved 2026-10-03.

## Approach

This module is research. Nothing is installed and no code is written. The output is one file, `spec/decisions/01-foundation/01-version-pins.md`, holding a version table that every later module installs from.

Every row is backed by evidence anyone can reproduce:

- **Stable status** — the version is what the registry's `latest` tag points to (`npm view <package> dist-tags`), it carries no pre-release suffix, and the vendor does not label it beta, preview, or experimental.
- **Compatibility** — the package's declared peer dependencies (`npm view <package>@<version> peerDependencies`), plus the vendor's own compatibility page or release note where one exists.

`npm view` only reads the registry. It installs nothing and changes nothing in the repo.

## Steps

One step is one commit. Each step's checkbox is ticked in the commit that completes it.

- [x] **1. Decisions file and method.** Create the decisions file with the evidence method above and an empty table: package, version, where it runs, stable evidence, compatibility evidence, installed in which phase.
- [x] **2. Choose the Expo SDK.** List the Expo SDKs that are currently stable and still supported. For each, check whether `@clerk/expo`, `react-native-purchases`, and `@sentry/react-native` have a stable release that supports it. Pick the newest SDK all three support, state which package was the constraint, and record the React Native, React, and React Native Web versions that SDK brings.
- [ ] **3. Pin the app's dependencies.** For the chosen SDK, record the versions it prescribes for Expo Router, `expo-sqlite`, `expo-camera`, `expo-image-picker`, `expo-image-manipulator`, `expo-notifications`, `expo-secure-store`, and `expo-sharing`; then the stable, compatible versions of `react-native-view-shot`, Zustand, `posthog-react-native`, jest-expo, and React Native Testing Library; and the Maestro release.
- [ ] **4. Pin the server and the tooling.** Node (current LTS), pnpm, TypeScript, Biome, Zod, Vitest, Fastify, `@clerk/fastify`, Prisma, pg-boss, `openai`, and `@sentry/node`.
- [ ] **5. Cross-check the set.** Confirm the pins agree with each other: one React version across the app's packages; the TypeScript version accepted by Expo and Prisma; the Zod version accepted by the `openai` SDK's Zod helper; the Node version accepted by Fastify, Prisma, and pg-boss. Record every conflict found and how it was resolved.
- [ ] **6. Update the stack and close the module.** Update [STACK.md](../../product/STACK.md) §6 with the chosen SDK, strike the §14 items this module answers, and record in the decisions file anything learned that later modules need.

## Files touched

- `spec/decisions/01-foundation/01-version-pins.md` — created in step 1, filled in steps 2–5.
- `spec/product/STACK.md` — step 6 only.
- `spec/plan/01-foundation/01-version-pins.md` — checkboxes.

## Risks

- **No Expo SDK satisfies all three native dependencies at a stable release.** The work stops at step 2 and the conflict goes to the product owner, because the answer changes [STACK.md](../../product/STACK.md).
- **The newest SDK all three support is an old one.** Clerk's published compatibility note covered SDK 54 and 55 when the stack was written, and the current SDK is 57. If the answer is an older SDK, step 2 also records how long Expo and the app stores will keep accepting builds from it.
- **A vendor's page and its package disagree** about what is supported. The package's declared peer dependencies win, and the disagreement is recorded.

## Verification

The module is done when:

1. Every dependency named in [STACK.md](../../product/STACK.md) §2–§10 has a complete row.
2. No row is an alpha, beta, release candidate, canary, or preview.
3. Re-running the recorded `npm view` commands returns the recorded versions as stable.
4. The Expo SDK row names the package that constrained the choice.
5. Step 5 lists the cross-checks performed, not just their result.
