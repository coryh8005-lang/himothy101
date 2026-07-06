# WHOIAM — Project Status

**Last updated:** 2026-07-06

## Current state

**M0 — Scaffold: ✅ complete** (built 2026-07-06 in a Claude Code cloud session). The app
exists: Expo SDK 57 project, four tabs (Today · Vault · Progress · Settings), WHOIAM design
system with dark mode, SQLite schema + migrations applied on launch, docs written.

### M0 verification record

Built in a Linux cloud container (no iOS Simulator available there), so M0 was verified by:

- ✅ `npm run typecheck` — TypeScript strict, clean
- ✅ `npm run verify:db` — generated migrations executed against real SQLite
  (better-sqlite3): all 8 tables created; inserts, joins, and foreign-key enforcement pass
- ✅ `npx expo export --platform ios` — full Metro/Hermes production bundle compiles
- ⬜ **Simulator boot check pending** — first session on a Mac should run `npx expo start`,
  press `i`, and confirm: app boots, 4 tabs render, Today shows the empty-goals state
  (proves DB migrated). Then tick this box.

## Milestones

| Milestone | Status |
|---|---|
| M0 — Scaffold | ✅ 2026-07-06 (Simulator boot check pending, see above) |
| M1 — Onboarding + Goals + Home | ⬜ next |
| M2 — Check-ins + notifications | ⬜ |
| 🔒 CONNOR GATE — Apple Developer enrollment | ⬜ (after M2; guide ready in `docs/APPLE_SETUP.md`) |
| M3 — Vault core | ⬜ |
| M4 — Unlock + auto-relock | ⬜ |
| M5 — Intercept polish | ⬜ |
| M6 — Progress/Settings/Profile hardening | ⬜ |

## Decisions log

**2026-07-06 (M0):**

- Repo: WHOIAM lives in the `WHOIAM/` folder of the `himothy101` GitHub repo
- Bundle IDs locked (per-bundle-ID entitlement form): app `com.whoiam.app`, extensions
  `com.whoiam.app.{ShieldConfiguration,ShieldAction,ActivityMonitor}`, App Group
  `group.com.whoiam.app` — table in `docs/APPLE_SETUP.md`
- Routes live in `src/app/` (SDK 57 template convention) rather than PLAN.md's root `app/`
- DB: Drizzle ORM over expo-sqlite; migrations generated to `src/db/migrations/`, applied by
  `useMigrations` in the root layout; `npm run verify:db` tests them on real SQLite in CI
- Design tokens: warm neutrals + deep sage-teal (`#2F6E62` light / `#7FBFAF` dark), dark
  mode first-class; native tabs use SF Symbols (Android icons deferred to Android phase)
- App version starts at 0.1.0

**2026-07-03 (planning):**

- Platform: **iOS first**, Android later · app name **WHOIAM**
- First milestone: working MVP on Connor's own iPhone
- Stack: Expo/React Native + react-native-device-activity, expo-sqlite local-first,
  Supabase/RevenueCat/Claude API in later phases
- Connor will enroll in the Apple Developer Program ($99/yr) — required before M3, not M0–M2
- Community, chatbot, paywall sequenced after the solo core loop (Phases 2–4)

## Next step

Execute **M1 — Onboarding + Goals + Home** from `PLAN.md`: goal creation flow
(build/break/quit + motivation text), Home/Today dashboard reading real goals, streak
display. *Verify: create a goal → appears on Home → survives relaunch.*
(If on a Mac, first do the 2-minute Simulator boot check above and record it.)

## Connor to-do queue

- None right now. (Apple Developer enrollment becomes relevant only after M2 —
  `docs/APPLE_SETUP.md` has the click-by-click guide waiting.)

## Open items

- Subscription pricing (decide during Phase 3)
- Visual branding (app icon/splash are still Expo defaults; iterate during M1 now that real
  screens exist)
- `expo lint` needs one online run to finish ESLint setup (blocked by the cloud proxy this
  session; harmless)
