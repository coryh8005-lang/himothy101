# WHOIAM — Project Status

**Last updated:** 2026-07-06

## Current state

**M1 — Onboarding + Goals + Home: ✅ complete** (built 2026-07-06, same cloud session as M0).
The app now has a real first-run experience and a working goals loop: onboarding
(welcome → pick build/break/quit + name it → motivation in your own words) creates the first
goal, the Today dashboard shows active goals with streak labels and a "+ New goal" button,
and each goal opens a detail screen with its motivation and an archive option. All data is
in SQLite, so goals survive relaunch by construction.

### Verification record

Built in a Linux cloud container (no iOS Simulator there). Verified this session:

- ✅ `npm run typecheck` — TypeScript strict, clean (typed routes included)
- ✅ `npm run verify:db` — migrations against real SQLite: 8 tables, joins, FKs pass
- ✅ `npx expo export --platform ios` — full Metro/Hermes bundle compiles with the new
  route tree (root stack → tabs group + onboarding + goal modals)
- ⬜ **Simulator check pending (M0+M1 together)** — on a Mac: `npx expo start`, press `i`,
  confirm: app boots into onboarding → create a goal → lands on Today with the goal card →
  relaunch the app → goal still there (M1 acceptance) → "+ New goal" and archive both work.

## Milestones

| Milestone | Status |
|---|---|
| M0 — Scaffold | ✅ 2026-07-06 |
| M1 — Onboarding + Goals + Home | ✅ 2026-07-06 (Simulator check pending, see above) |
| M2 — Check-ins + notifications | ⬜ next |
| 🔒 CONNOR GATE — Apple Developer enrollment | ⬜ (after M2; guide ready in `docs/APPLE_SETUP.md`) |
| M3 — Vault core | ⬜ |
| M4 — Unlock + auto-relock | ⬜ |
| M5 — Intercept polish | ⬜ |
| M6 — Progress/Settings/Profile hardening | ⬜ |

## Decisions log

**2026-07-06 (M1):**

- Route tree: root Stack → `(tabs)` group + `onboarding/` (3-screen flow, swipe-back
  disabled) + `goal/new` and `goal/[id]` as modals
- Onboarding is gated by a `kv` flag (`onboarding_complete`); Today redirects to it on
  first launch
- Onboarding intentionally lean (welcome → goal → motivation); permissions, check-in-time,
  and vault-setup steps join the flow in M2/M3 when those features exist
- Streaks: every goal gets a `streaks` row at creation; display-only for now
  ("Day 1 starts today" until counting logic lands with check-ins in M2)
- Archiving never deletes — goals are soft-archived, history stays
- Design system grew: `Button` (primary/secondary/ghost), `TextField`, `KindSelector`

**2026-07-06 (M0):**

- Repo: WHOIAM lives in the `WHOIAM/` folder of the `himothy101` GitHub repo
- Bundle IDs locked: app `com.whoiam.app`, extensions
  `com.whoiam.app.{ShieldConfiguration,ShieldAction,ActivityMonitor}`, App Group
  `group.com.whoiam.app` — table in `docs/APPLE_SETUP.md`
- Routes live in `src/app/` (SDK 57 template convention) rather than PLAN.md's root `app/`
- DB: Drizzle ORM over expo-sqlite; migrations applied on launch; `npm run verify:db`
  tests them on real SQLite
- Design tokens: warm neutrals + deep sage-teal (`#2F6E62` light / `#7FBFAF` dark), dark
  mode first-class; native tabs use SF Symbols (Android icons deferred)
- App version starts at 0.1.0

**2026-07-03 (planning):**

- Platform: **iOS first**, Android later · app name **WHOIAM**
- First milestone: working MVP on Connor's own iPhone
- Stack: Expo/React Native + react-native-device-activity, expo-sqlite local-first,
  Supabase/RevenueCat/Claude API in later phases
- Connor will enroll in the Apple Developer Program ($99/yr) — required before M3, not M0–M2
- Community, chatbot, paywall sequenced after the solo core loop (Phases 2–4)

## Next step

Execute **M2 — Check-ins + notifications** from `PLAN.md`: three user-scheduled repeating
daily local notifications (expo-notifications), the check-in flow (mood 1–5, urge 0–10,
had-slip + note), and Progress activity log v1. *Verify on a device: schedule a
notification 2 minutes out → it fires → complete the check-in → it appears in Progress.*

**After M2 is verified comes the 🔒 CONNOR GATE:** Apple Developer enrollment
(`docs/APPLE_SETUP.md` has the click-by-click guide).

## Connor to-do queue

- None right now.

## Open items

- Subscription pricing (decide during Phase 3)
- Visual branding (app icon/splash still Expo defaults; onboarding/dashboard now exist to
  anchor the direction)
- `expo lint` needs one online run to finish ESLint setup (blocked by the cloud proxy;
  harmless)
