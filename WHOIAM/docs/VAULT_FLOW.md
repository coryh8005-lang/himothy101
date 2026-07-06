# WHOIAM — Vault Flow (core feature spec)

The vault locks distracting apps behind deliberate friction using Apple's Screen Time stack
(FamilyControls / ManagedSettings / DeviceActivity) via `react-native-device-activity`.
Built across milestones M3 (block), M4 (unlock/relock), M5 (intercept polish).

## Hard platform constraints (researched July 2026 — see PLAN.md)

1. Screen Time APIs work **only on a real iPhone (iOS 16+)**, never the Simulator, and only
   on a **paid** Apple Developer team. The development Family Controls entitlement is
   auto-available on a paid team; the **distribution** entitlement (TestFlight/App Store)
   requires a per-bundle-ID request with 1-day-to-~4.5-week approval — submit the day
   enrollment completes.
2. **A shield button cannot open our app.** The intercept is: shield button records the tap
   (App Group marker) and tells the user to open WHOIAM, plus an optional one-time guided
   iOS Shortcuts automation ("When Instagram opens → open WHOIAM") for the seamless bounce.
   The deep-link-from-shield hack is deliberately excluded (App Review risk).
3. **Short timers lag ~1 min** and sub-15-min DeviceActivity schedules are unreliable →
   primary durations 15/30/60 min; 5/10 min allowed with a foreground fallback re-block.

## The five steps

1. **Setup (M3):** request FamilyControls authorization → user picks apps via the system
   `FamilyActivityPicker` → save opaque selection token to App Group storage + a
   `vault_rules` row (`selection_ref` points at the token) → configure shield appearance
   (title tied to the user's own motivation text) → apply the shield (`blockSelection`).
2. **Intercept (M3/M5):** user taps Instagram → iOS shows WHOIAM's custom shield. The shield
   button writes a `pending_unlock` marker to the App Group; the user opens WHOIAM manually,
   or the optional Shortcuts automation bounces them in.
3. **Friction gate (M4):** on foreground the app sees the marker → routes to
   `unlock/[ruleId]` → user types what they'll do + picks a duration (15/30/60 primary).
4. **Grant (M4):** `unblockSelection` → schedule a DeviceActivity monitor for now+N that
   re-applies the shield at expiry → insert an `unlock_events` row. A foreground fallback
   re-blocks if the monitor lagged.
5. **Re-lock + log (M4):** the extension re-shields at expiry and appends event history to
   the App Group; the next app foreground syncs it into `unlock_events.ended_at` /
   `ended_reason` → visible in Progress.

## Risk containment

All `react-native-device-activity` calls stay behind `src/vault/` (created at M3): the
library is pre-1.0 and single-maintainer, so the rest of the app never imports it directly.
If its config plugin breaks on Expo SDK 57, pin the project to SDK 56; a native fork remains
possible without touching app code.
