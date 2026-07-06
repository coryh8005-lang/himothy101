# WHOIAM — Project Status

**Last updated:** 2026-07-06

## Current state

**M2 — Check-ins + notifications: ✅ built** (2026-07-06, same cloud session as M0–M1).
The solo core loop minus the vault is now in place: three daily check-in reminders
(user-editable times, expo-notifications local triggers), a check-in flow (mood 1–5, urge
0–10, slip toggle with per-goal attribution and a note), streak counting driven by
check-ins and slips, and Progress is now a real unified activity log.

### What M2 added

- `src/notifications/` — schedules three repeating daily local notifications from the
  `notification_schedules` table (defaults 8:30 / 14:30 / 21:00, seeded on first Settings
  visit); reconciles OS state on every change; tapping a reminder deep-links to the
  check-in screen
- `checkin/new` modal — mood/urge chips, "did you slip?" with goal attribution ("this is
  data, not a verdict"), optional note
- Streak rule v1: first check-in of a local day counts the day for every active goal; a
  slip logged against a goal resets that goal's current streak to 0 (longest is kept)
- Today: live "X of 3 today" check-in card + "Check in now"
- Progress: merged, time-sorted log of check-ins and slip-ups (unlock events join in M4)
- Settings: per-reminder time picker (iOS compact / Android dialog) + enable switches +
  permission request

### Verification record

Built in a Linux cloud container (no iOS Simulator/device there). Verified this session:

- ✅ `npm run typecheck` · ✅ `npm run verify:db` · ✅ `npx expo export --platform ios`
- ⬜ **Device check pending (the real M2 acceptance):** on Connor's iPhone or Simulator —
  Settings → allow notifications → set a reminder ~2 min out → notification fires → tap it
  → check-in screen opens → complete it → appears in Progress and Today's counter; also
  confirm a slip check-in resets that goal's streak. (Notifications need a real device to
  fully verify; Simulator shows banners for local notifications too.)
- ⬜ Simulator run-through of M0/M1 flows (carried over)

## Milestones

| Milestone | Status |
|---|---|
| M0 — Scaffold | ✅ 2026-07-06 |
| M1 — Onboarding + Goals + Home | ✅ 2026-07-06 |
| M2 — Check-ins + notifications | ✅ built 2026-07-06 (device check pending) |
| 🔒 CONNOR GATE — Apple Developer enrollment | ⬜ **NOW OPEN — see below** |
| M3 — Vault core | ⬜ next after the gate |
| M4 — Unlock + auto-relock | ⬜ |
| M5 — Intercept polish | ⬜ |
| M6 — Progress/Settings/Profile hardening | ⬜ |

## Decisions log

**2026-07-06 (M2):**

- Reminder defaults 08:30 / 14:30 / 21:00; `notification_schedules` is source of truth,
  `applySchedules()` reconciles the OS (cancel + reschedule + store identifiers)
- Check-ins are global (not per-goal); slips are attributed to a goal via chips
- A slip during check-in writes both the check-in row and a `slip_ups` row
- Streak rule v1 as described above; deliberately simple, recomputable later
- Notification deep-link uses `data.url` + `useLastNotificationResponse` in the root layout
- Sound off for reminders (calm by default); revisit with user feedback

**2026-07-06 (M1):** root Stack → (tabs) + onboarding + modals; onboarding gated by kv
flag; streak row per goal; soft-archive only; Button/TextField/KindSelector added.

**2026-07-06 (M0):** repo `himothy101/WHOIAM`; bundle IDs locked (`com.whoiam.app` + 3
extension IDs + App Group, table in `docs/APPLE_SETUP.md`); routes in `src/app/`; Drizzle
over expo-sqlite with launch-time migrations; sage-teal design tokens, dark mode
first-class; v0.1.0.

**2026-07-03 (planning):** iOS first · name WHOIAM · MVP on Connor's iPhone first ·
Expo + react-native-device-activity + expo-sqlite local-first · Apple Developer enrollment
before M3 · community/chatbot/paywall in Phases 2–4.

### Interim work while waiting on the gate (2026-07-06, later same day)

- **Branding v1:** real app icon — a continuous ivory "W" whose last stroke rises into a
  floating point of light (reads as "W‑i", *who I am*) on a sage-teal gradient. One SVG
  source generates icon, splash, favicon, and Android adaptive set via
  `npm run brand:generate` (`scripts/generate-brand-assets.mjs`); splash background now
  deep teal `#1C463E`. Expo's default icon bundle removed.
- **Crisis resources from day one** (pulled forward from Phase 2's safety work): Settings
  now has an "If it's heavy right now" card — call/text **988** and **SAMHSA
  1‑800‑662‑4357** buttons that dial even offline. Full safety layer + `docs/SAFETY.md`
  still land with the Phase 2 chatbot.
- **ESLint finished offline:** flat config checked in (`eslint.config.js`), all findings
  fixed (typographic apostrophes in UI copy, hydration hook rewritten to
  `useSyncExternalStore`); `npx eslint .` is clean. Open item closed.

## Next step

**🔒 CONNOR GATE is now open.** M3 (the vault — the make-or-break feature) requires the
Apple Developer Program. Connor: follow the click-by-click guide in `docs/APPLE_SETUP.md`
(≈10 minutes + $99/yr; approval usually <48h), then start the next session with
*"enrollment approved"*.

Meanwhile the next coding session can also: run the pending Simulator/device checks above,
and (optional, no Apple account needed) polish branding (app icon/splash).

## Connor to-do queue

1. **Enroll in the Apple Developer Program** — `docs/APPLE_SETUP.md`, top section.
   Everything for M3 is blocked on this; M0–M2 device checks are not.

## Open items

- Subscription pricing (decide during Phase 3)
- Branding v1 shipped; review the real icon on a device home screen during M3 and iterate
  if it doesn't land
