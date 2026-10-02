# Sugar Quit App — Streak + Sugar Scanner

## 1. Overview

A quit-sugar app combining the proven streak/recovery engine (Quittr playbook) with a narrow AI photo scanner that answers one question: "how much sugar is in this?" The problem: sugar reduction is a mass-market, annually recurring goal (every January), tied to weight, skin, energy, and diabetes fear — yet the category leader earns under $5K/month and the space is fragmented micro-apps. Unlike generic calorie tracking (saturated by Cal AI clones), a sugar-only scanner plus habit streak serves a specific emotional goal with no dominant incumbent.

## 2. Existing Similar Products

| Product | Notes |
|---|---|
| **Sugarfree** | Category leader-ish — <5K downloads and <$5K revenue/month (Apptopia) |
| **Sugarcut / StopSugar / No Sugar Challenge / Sugarless** | Fragmented micro-apps, basic day counters |
| **I Am Sober** | Generic sobriety counter; sugar listed as a trackable vice, no food features |
| **Cal AI / MyFitnessPal** | Full calorie tracking — heavyweight, not sugar-focused, different daily job |
| **Quittr** | Playbook reference for streak/paywall mechanics |

## 3. How to Build/Clone It

**Core tech stack**
- Mobile: React Native (Expo) + TypeScript
- Scanner: vision LLM API (Claude/GPT vision) prompted for added-sugar estimation + OpenFoodFacts barcode DB for packaged goods (free, global, covers the reliable path)
- Backend: Supabase for auth/sync + a FastAPI (Python) scan service for the barcode-lookup/vision pipeline, Dockerized
- Paywall: Superwall/RevenueCat quiz-funnel
- Push: daily check-in + craving-window reminders

**Architecture**
- Client: streak engine, daily checklist, craving log, scanner UI
- Server: scan pipeline (barcode lookup first, vision fallback), user state sync, content CMS for the withdrawal-timeline content
- Science content layer: day-by-day "what's happening in your body" timeline (dopamine reset, skin, energy) — the retention content sugar uniquely supports

**MVP feature list**
1. Quiz: sugar habits, triggers, health goals → personalized "sugar-free plan" → hard paywall
2. Streak counter + body-timeline ("Day 4: cravings peak today — here's why")
3. Barcode scan → instant added-sugar verdict (traffic-light + teaspoons visualization)
4. Photo scan for unpackaged food (dessert, chai, cereal) → sugar estimate
5. Daily checklist: check-in, log cravings, water, protein swap suggestion
6. Craving SOS button: 5-minute delay timer + swap suggestions
7. January challenge mode (cohort-based 30-day no-sugar challenge — the acquisition event)

**Build sequence**
1. Streak + quiz + paywall (week 1–2)
2. Barcode scanner via OpenFoodFacts (week 2 — reliable, ship first)
3. Photo scanner via vision API (week 3–4)
4. Body timeline content + SOS (week 4)
5. Launch before January; TikTok "sugar detox" creators

## 4. Feature Comparison

| Feature | Sugarfree | StopSugar etc. | I Am Sober | Cal AI/MFP | Clone target |
|---|---|---|---|---|---|
| Sugar streak counter | ✅ | ✅ | ✅ generic | ❌ | ✅ |
| Sugar-specific scanner | Partial/gestured | ❌ | ❌ | Full calories (overkill) | ✅ barcode + photo |
| Withdrawal body-timeline | ❌ | ❌ | ❌ | ❌ | ✅ |
| Craving SOS | ❌ | ❌ | Basic | ❌ | ✅ |
| Cohort challenges (January) | ❌ | Some | ❌ | ❌ | ✅ |
| Teaspoon visualization | ❌ | ❌ | ❌ | grams only | ✅ (visceral unit) |

## 5. Gaps & Opportunities

1. **No leader**: highest-visibility competitor earns under $5K/mo — winnable with standard playbook execution.
2. **Scanner + streak combo exists nowhere**: counters have no food tools; food apps have no quit mechanics.
3. **Annual January demand spike**: predictable, free acquisition window every year; no app owns "Sugar-Free January."
4. **Visceral units**: showing sugar in teaspoons (not grams) is a known behavior-change trick no app uses.

## 6. New Feature Proposals

**Teaspoon-verdict scanner**
- As someone quitting sugar, I want to scan any product or plate and instantly see its sugar as teaspoons with a red/yellow/green verdict, so that I can decide in the aisle without reading labels.
- Impact: the daily-use hook (multiple scans/day) that pure counters lack; visceral unit drives shareable "this drink is 16 teaspoons" moments.

**Body-timeline streak**
- As a quitter on day 4, I want to see exactly what's happening in my body today and when cravings will fade, so that I hold on through the hard days.
- Impact: converts the streak from a number into a story; sugar withdrawal has a well-documented arc no competitor narrates.

**January cohort challenge**
- As a New Year quitter, I want to join a 30-day cohort with daily group check-ins, so that social accountability carries me past the day-10 dropout cliff.
- Impact: owns the annual demand spike; cohort mechanics double completion rates vs solo streaks.

## 7. Sources

- https://apptopia.com/ios/app/1557550593/about
- https://startupspells.com/p/porn-addiction-app-quittr-250k-mrr-4-months
- https://www.revenuecat.com/state-of-subscription-apps
- https://world.openfoodfacts.org/
- https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens/
