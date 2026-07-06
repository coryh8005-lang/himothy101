# WHOIAM — Apple Setup (Connor's guide)

This is the one part of the project Claude can't do for you. None of it is needed until
milestone M3 — the app runs in the Simulator for M0–M2 without any Apple account.

## Locked bundle IDs (do not change — the entitlement request is per bundle ID)

| Target | Bundle ID |
|---|---|
| App | `com.whoiam.app` |
| Shield Configuration extension (M3) | `com.whoiam.app.ShieldConfiguration` |
| Shield Action extension (M3) | `com.whoiam.app.ShieldAction` |
| Device Activity Monitor extension (M3) | `com.whoiam.app.ActivityMonitor` |
| App Group (M3) | `group.com.whoiam.app` |

## 🔒 CONNOR GATE — Apple Developer Program enrollment ($99/yr)

Do this when M2 is verified (Claude will remind you). Approval is usually under 48 hours.

1. On your iPhone or Mac, go to **developer.apple.com/programs/enroll**.
2. Sign in with your personal Apple ID (the one on your iPhone). If it doesn't have
   two-factor authentication, Settings will walk you through turning it on first.
3. Choose **Individual/Sole Proprietor** (not Organization).
4. Fill in your legal name and address exactly as they appear on your payment card.
5. Pay the **$99 USD** annual fee.
6. Wait for the "Welcome to the Apple Developer Program" email (usually <48h; occasionally
   Apple asks for an ID photo — just follow their email).
7. Tell Claude "enrollment approved" in the next session.

## Immediately after enrollment (Claude drives, you click)

1. **Distribution Family Controls entitlement request** — submitted right away because
   approval can take up to ~4.5 weeks and it's only needed at Phase 4 (TestFlight):
   Claude will give you the exact form
   (developer.apple.com → Contact Us → Family Controls distribution request) and the text
   to paste, one field at a time. The *development* entitlement needs no request — it works
   on a paid team automatically, which is all M3–M6 need.
2. **First device build (M3):** plug your iPhone into the Mac, tap **Trust** on the phone,
   and approve the signing prompts Claude points you to in Xcode. Claude does everything
   else.

## What you never need to touch

Xcode project settings, certificates, provisioning profiles, config files, the terminal —
all automated via Expo prebuild + automatic signing.
