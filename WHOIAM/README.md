# WHOIAM

A habit & addiction-recovery iOS app: lock distracting apps behind deliberate friction,
set identity-level goals, check in three times a day, and keep an honest progress log.
*Every action is a vote for who you're becoming.*

## Status

Milestone **M0 (scaffold) complete** — see `PROJECT_STATUS.md` for the live tracker and
`PLAN.md` for the master roadmap.

## Working on this project

Open Claude Code in this folder and say:
*"Read PLAN.md and PROJECT_STATUS.md, then execute the next milestone."*

## Development

```bash
npm install
npx expo start          # then press i for the iOS Simulator
npm run typecheck       # TS strict mode
npm run verify:db       # migrations against real SQLite
npm run db:generate     # regenerate migrations after editing src/db/schema.ts
```

Docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
[`docs/VAULT_FLOW.md`](docs/VAULT_FLOW.md) ·
[`docs/APPLE_SETUP.md`](docs/APPLE_SETUP.md)
