# WHOIAM — Habit & Addiction Recovery App: Master Build Plan

> **How to use this file:** Open Claude Code in this folder and say *"Read PLAN.md and PROJECT_STATUS.md, then execute the next milestone."* Claude does all coding and building; your only tasks are the ones marked **CONNOR GATE**. Progress is tracked in `PROJECT_STATUS.md`.

## Context

Connor wants a subscription-based iOS app (Android later) that helps people fight addictions and build/break habits. The core differentiator is an **App Vault** (like ScreenZen/Opal): users lock distracting apps behind deliberate friction — to unlock Instagram they must state what they'll use it for and for how long, then a timer grants temporary access and auto-relocks. Around that core: goal setting, a home dashboard, 3x-daily scheduled check-in notifications, a progress/activity log (including slip-ups), an AI emergency-support chatbot, a community accountability feed, and a freemium paywall (essentials free; lesson plans and advanced options premium).

Connor is a non-coder: Claude Code does 100% of coding, building, and configuration; Connor only performs steps that legally/physically require him (Apple enrollment, plugging in his iPhone, tapping approvals). This plan is the master roadmap, executed milestone-by-milestone across sessions, with `PROJECT_STATUS.md` as the cold-start handoff control surface.

**Decisions locked with Connor (2026-07-03):** iOS first · app name **WHOIAM** · first milestone = working MVP on his own iPhone · he will enroll in the Apple Developer Program ($99/yr).

## Verified platform facts that shape this plan (researched July 2026)

1. **The vault requires Apple's Screen Time stack** (FamilyControls / ManagedSettings / DeviceActivity). It only works on a **real iPhone (iOS 16+), never the Simulator**, and **only on a paid Apple Developer team** — free personal teams cannot use Family Controls. The $99 enrollment is therefore a hard gate before vault work (milestone M3).
2. **Two entitlements:** the *development* Family Controls entitlement is auto-available on a paid team (build to Connor's phone immediately). The *distribution* entitlement (needed for TestFlight/App Store) requires a per-bundle-ID request form; real-world approval ranges **1 day to ~4.5 weeks** → submit the form the day enrollment completes, as a parallel track.
3. **Apple does not allow a shield (block screen) button to open our app.** The ScreenZen-style intercept is achieved instead by: (a) shield button records the tap and tells the user to open WHOIAM (always works), plus (b) an optional one-time guided **iOS Shortcuts automation** ("When Instagram opens → open WHOIAM") for the seamless auto-bounce feel. The fragile deep-link-from-shield hack used by some apps is deliberately excluded (App Review risk).
4. **Short unlock timers have ~1 min of OS lag** and sub-15-min monitor schedules are unreliable → primary durations 15/30/60 min; 5/10 min allowed with a foreground fallback re-block.
5. **Current versions:** Expo SDK 57 (`expo@57.0.2`), `react-native-device-activity@0.6.1` (Kingstinct, Feb 2026 — pre-1.0; if its config plugin breaks on SDK 57, pin the project to SDK 56), `react-native-purchases@10.4.1`, `@supabase/supabase-js@2.110.0`.

## Stack

| Layer | Choice | Why |
|---|---|---|
| App framework | **Expo SDK 57** (React Native, TypeScript) + expo-router + dev client | Cross-platform path for later Android; fastest iteration |
| Vault (Screen Time) | **react-native-device-activity** (wraps FamilyControls/ManagedSettings/DeviceActivity; generates the 3 required native extensions) | Only maintained RN library covering the full ScreenZen pattern |
| Local data | **expo-sqlite** (+ Drizzle ORM for typed migrations) — local-first, no account required for core loop | Privacy selling point for recovery data; zero-friction start |
| Notifications | **expo-notifications** — 3 repeating daily calendar triggers (uses 3 of iOS's 64 pending-notification slots) | Local, offline-capable, schedulable |
| Builds (Phase 1) | `npx expo prebuild` + **local Xcode builds** to device (automatic signing) | Works with dev entitlement immediately; EAS deferred to Phase 4 |
| Backend (Phase 2) | **Supabase** free tier — auth (Sign in with Apple + email), Postgres + RLS, Edge Functions | Standard, free, Claude-buildable |
| Chatbot (Phase 2) | **Claude API** behind a Supabase Edge Function (key never in the app): `claude-sonnet-5` conversation + `claude-haiku-4-5`/keyword triage layer | Safety-critical empathy; cost ~sub-cent per turn |
| Subscriptions (Phase 3) | **RevenueCat** (`react-native-purchases` + paywall UI) | Free under $2.5k/mo; handles StoreKit |
| UI quality | Use the **frontend-design skill** when building screens; calm, supportive, identity-focused aesthetic ("every action is a vote for who you're becoming"); dark mode from day one | |

## Project structure (to create)

```
WHOIAM/
  PLAN.md                   # this file — master roadmap
  PROJECT_STATUS.md         # milestone tracker + Connor to-do queue (read first every session)
  app/                      # expo-router routes
    _layout.tsx             # providers, DB init, theme
    (onboarding)/           # welcome → permissions → goals → motivations → checkin-times → vault-setup
    (tabs)/                 # index (Home/Today) · vault/ · progress · settings
    unlock/[ruleId].tsx     # THE friction gate: intent → duration → grant
    goal/[id].tsx · checkin/new.tsx · profile.tsx
  src/
    db/                     # SQLite schema, migrations, typed queries
    vault/                  # device-activity wrapper — isolates the risky dependency behind one module
    notifications/          # check-in scheduling + handlers
    features/               # goals, checkins, slipups, streaks (pure logic)
    ui/                     # design system components
  docs/                     # ARCHITECTURE.md · VAULT_FLOW.md · APPLE_SETUP.md · SAFETY.md
  app.config.ts             # config plugins: device-activity (App Group, team ID, extensions), notifications, build-properties
```

Keep `ios/` git-ignored (regenerated by prebuild); all native config flows through `app.config.ts`. `git init` at M0. Bundle IDs (app + 3 extensions) locked at M0 since the entitlement form is per-bundle-ID.

## Data model (SQLite, MVP)

- `goals` — kind(build|break|quit), title, motivation_text, schedule, active/archived
- `vault_rules` — goal link, selection_ref (pointer to opaque Screen Time token in App Group storage), shield copy, default_unlock_minutes
- `unlock_events` — rule, intent_text, requested_minutes, granted_at, expires_at, ended_reason — the audit log
- `check_ins` — scheduled_for, completed_at, mood 1–5, urge 0–10, had_slip, note
- `slip_ups` — goal, occurred_at, what, trigger, severity, note
- `streaks` — per-goal current/longest (denormalized, recomputable)
- `notification_schedules` — time, enabled, OS identifier
- `kv` — settings/flags

Opaque Screen Time selection tokens, shield configs, and extension event history live in **App Group UserDefaults** (the only channel extensions can share); a foreground sync bridges them into SQLite.

## Vault flow (core feature spec)

1. **Setup:** request FamilyControls authorization → user picks apps via the system `FamilyActivityPicker` → save opaque selection to App Group + `vault_rules` row → configure shield appearance (title tied to the user's own motivation text) → `blockSelection` applies the shield.
2. **Intercept:** user taps Instagram → iOS shows WHOIAM's custom shield. Shield button records a `pending_unlock` marker to App Group; user opens WHOIAM (or the optional Shortcuts automation bounces them in automatically).
3. **Friction gate:** app foregrounds, sees the marker, opens `unlock/[ruleId]` → user types intent + picks duration (15/30/60 primary).
4. **Grant:** `unblockSelection` → schedule a DeviceActivity monitor for now+N that runs `blockSelection` when time expires → insert `unlock_events` row. Foreground fallback re-blocks if the monitor lagged.
5. **Re-lock + log:** extension re-shields at expiry and appends event history; next app foreground syncs history → `unlock_events.ended_at` → shows in Progress.

## Phase 1 — MVP on Connor's iPhone

Each milestone ends with an on-device/simulator verification before moving on. M0–M2 need no Apple account (Simulator/free signing); M3+ require the paid team + physical iPhone.

- **M0 — Scaffold.** git init, Expo app, tabs, theme/design system, SQLite migrations, docs/, PROJECT_STATUS.md update. *Verify: app boots in Simulator, tables created.*
- **M1 — Onboarding + Goals + Home.** Goal creation (build/break/quit + motivation), Home/Today dashboard with streaks. *Verify: create goal → on Home → survives relaunch.*
- **M2 — Check-ins + notifications.** 3 user-scheduled repeating daily notifications; check-in flow (mood/urge/slip); Progress activity log v1. *Verify on device: schedule a notification 2 min out → fires → complete check-in → appears in Progress.*
- **🔒 CONNOR GATE (before M3):** enroll in Apple Developer Program — Claude provides click-by-click guidance in `docs/APPLE_SETUP.md`; approval usually <48h. Immediately after: Claude submits the **distribution** Family Controls entitlement request (parallel track; not needed until Phase 4).
- **M3 — Vault core (the make-or-break; do first thing after enrollment).** Prebuild with device-activity plugin (App Group, team ID, 3 extensions), local Xcode build to iPhone, authorization + picker + shield + block. *Verify on Connor's iPhone: lock Instagram → tapping it shows WHOIAM's shield.* Fallback if SDK 57 breaks the plugin: pin to SDK 56.
- **M4 — Unlock + auto-relock.** Intent→duration gate, timed unblock, monitor re-block, fallback, unlock_events logging. *Verify: 15-min unlock → use Instagram → auto re-lock → event in Progress.*
- **M5 — Intercept polish.** pending_unlock marker flow, guided Shortcuts-automation setup screen (optional seamless bounce), shield copy personalization. *Verify: full tap→intent→timer→relock loop feels right.*
- **M6 — Progress/Settings/Profile hardening.** Unified activity log (check-ins, slip-ups, unlocks), edit schedules, manage vault rules, profile basics. *Verify: every event type visible; MVP complete — Connor uses it daily.*

## Phase 2 — Accounts, sync, emergency chatbot

Supabase auth (Sign in with Apple + email; account optional — local stays source of truth), profile sync. Emergency chatbot via Edge Function → Claude API with **non-negotiable safety layer**: deterministic crisis-keyword rules + Haiku triage that surface 988 / SAMHSA (1-800-662-4357) regardless of model output, no-medical-advice system prompt, hotlines also reachable offline from the app. Write `docs/SAFETY.md`.

## Phase 3 — Monetization + lessons

RevenueCat + StoreKit products, paywall screen, entitlement gating. Free/premium split (principle: **the safety-critical core loop is never paywalled**):

| Free | Premium |
|---|---|
| Vault (lock/intercept/unlock/relock), goals, streaks, 3x check-ins, progress log, **emergency chatbot + hotlines** | Lesson-plan curriculum, advanced/adaptive notifications, strict "hard mode" & scheduled vault blocks, long-range analytics/exports, themes, partner matching |

Lesson content structure + first premium lesson pack.

## Phase 4 — Community + release

Accountability feed (posts, encouragement, comments) with **mandatory App Store UGC compliance**: report/block/mute + EULA + moderation tooling. Confirm distribution entitlement approved → EAS Build → TestFlight beta → App Store submission (privacy policy, screenshots, health-app disclaimers, privacy manifests).

## Costs

Phase 1 total: **$99** (Apple Developer). Supabase/RevenueCat/EAS free tiers thereafter; Claude API roughly cents/day at MVP volume.

## Top risks

1. **Entitlement delay (up to ~4.5 wks)** → dev entitlement unblocks all Phase 1–3 work; submit distribution form day one.
2. **`react-native-device-activity` is pre-1.0, single-maintainer** → all calls isolated behind `src/vault/`; SDK 56 pin as fallback; native-fork possible without touching app code.
3. **Apple shield limitation** → intercept UX designed around it (marker + Shortcuts automation), not against it.
4. **App Review scrutiny (health/recovery + UGC)** → crisis resources from day one, permission rationale strings, full moderation before community ships.
5. **Short-timer unreliability** → 15/30/60 primary durations + foreground fallback re-block.

## Verification

- Per-milestone on-device checks listed above; PROJECT_STATUS.md records each "verified on device" with date.
- End-to-end MVP acceptance test (M6): fresh install → onboard → create goal → lock Instagram → attempt open → shield → intent gate → 15-min access → auto-relock → check-in notification fires at scheduled time → complete check-in → log a slip-up → Progress shows all of it → relaunch, everything persists.
- Before any App Store submission: run the full loop on a clean device profile + the `verify` skill against each feature.

## Session workflow (for every future session)

1. Read `PROJECT_STATUS.md` → find current milestone + Connor to-do queue.
2. Execute the next milestone; build to Simulator/device; verify.
3. Update PROJECT_STATUS.md (milestone status, decisions, Connor gates) before ending.
4. Connor-facing asks must be non-technical, click-by-click (he never touches code or CLI).
