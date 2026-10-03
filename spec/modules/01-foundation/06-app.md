# Module 01.06 — App

> **Story:** [01 — Foundation](../../stories/01-foundation.md) · **Covers:** S01-AC2, S01-AC3, S01-AC4, S01-AC5 (the last three in part) · **Depends on:** 01.01, 01.02, 01.03, 01.04
> **Status:** Approved 2026-10-03.

## Purpose

One Expo app that boots on iOS, Android, and web and proves that the shared packages reach all three. This is where the monorepo wiring is most likely to break, so it is proven with almost nothing on screen.

## Responsibilities

- `apps/app`: Expo with Expo Router on the SDK pinned in 01.01.
- Metro configured so the app resolves `packages/core` and `packages/content` from the workspace.
- One screen showing today's local date from `localDateOf` and the tagline from `packages/content`. It is a wiring check, replaced in Story 02.
- An iOS development build, an Android development build, and a web export.
- The design-token module ([STACK.md](../../product/STACK.md) §6) with only the tokens this screen uses.
- One jest-expo test of the screen.
- Two new gates in the root `check` script: the app tests and the web export.

## Interface

- **The web export's output directory**, consumed by 01.07.
- **The app identity** — the display name Unspoon, the iOS bundle identifier, and the Android package name — set once here.
- **The EAS project and build profiles** later stories build with.

## Acceptance criteria

- The app opens on an iOS simulator or device, an Android emulator or device, and in a browser.
- The date and the tagline are identical on all three.
- Changing the tagline in `packages/content` changes it on all three with no edit in `apps/app`.
- The jest-expo test and the web export run in CI and pass; a broken screen test makes CI fail.
- The app bundle contains no secret.

## Out of scope

- Any call to the API. The app and the API first meet in Phase 2.
- Clerk, RevenueCat, the local day-log store, the camera, and notifications.
- Navigation beyond the single route.

## Needs from the product owner

- An Expo account.
- The iOS bundle identifier and Android package name.
- An Apple Developer account for a build on a physical iPhone. A simulator build does not need one.
