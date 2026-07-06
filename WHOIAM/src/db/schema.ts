/**
 * WHOIAM local-first schema (SQLite via expo-sqlite + Drizzle).
 *
 * Everything the core loop needs lives on-device; no account required.
 * Opaque Screen Time selection tokens are NOT stored here — they live in
 * App Group UserDefaults (the only storage extensions can share) and
 * `vault_rules.selection_ref` points at them. See docs/ARCHITECTURE.md.
 *
 * Timestamps are unix epoch milliseconds (`timestamp_ms` mode) set by app
 * code. Local calendar days (streaks, check-in scheduling) use `YYYY-MM-DD`
 * strings to stay stable across timezone changes.
 */

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kind: text('kind', { enum: ['build', 'break', 'quit'] }).notNull(),
  title: text('title').notNull(),
  /** The user's own words on why this matters — reused on shields and check-ins. */
  motivationText: text('motivation_text'),
  /** JSON: which days/cadence the goal applies (shape finalized in M1). */
  scheduleJson: text('schedule_json'),
  status: text('status', { enum: ['active', 'archived'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
});

export const vaultRules = sqliteTable(
  'vault_rules',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    goalId: integer('goal_id').references(() => goals.id),
    /** Key of the opaque FamilyActivitySelection token in App Group storage. */
    selectionRef: text('selection_ref').notNull(),
    /** Personalized shield copy, defaults derived from the goal's motivation. */
    shieldTitle: text('shield_title'),
    shieldSubtitle: text('shield_subtitle'),
    defaultUnlockMinutes: integer('default_unlock_minutes').notNull().default(15),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [index('vault_rules_goal_idx').on(t.goalId)],
);

/** Audit log of every pass through the friction gate. */
export const unlockEvents = sqliteTable(
  'unlock_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ruleId: integer('rule_id')
      .notNull()
      .references(() => vaultRules.id),
    intentText: text('intent_text').notNull(),
    requestedMinutes: integer('requested_minutes').notNull(),
    grantedAt: integer('granted_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    endedAt: integer('ended_at', { mode: 'timestamp_ms' }),
    endedReason: text('ended_reason', {
      enum: ['expired', 'manual_relock', 'fallback_relock', 'cancelled'],
    }),
  },
  (t) => [index('unlock_events_rule_time_idx').on(t.ruleId, t.grantedAt)],
);

export const checkIns = sqliteTable(
  'check_ins',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    scheduledFor: integer('scheduled_for', { mode: 'timestamp_ms' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    /** 1 (rough) – 5 (great). */
    mood: integer('mood'),
    /** 0 (none) – 10 (overwhelming). */
    urge: integer('urge'),
    hadSlip: integer('had_slip', { mode: 'boolean' }),
    note: text('note'),
  },
  (t) => [index('check_ins_scheduled_idx').on(t.scheduledFor)],
);

export const slipUps = sqliteTable(
  'slip_ups',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    goalId: integer('goal_id').references(() => goals.id),
    occurredAt: integer('occurred_at', { mode: 'timestamp_ms' }).notNull(),
    what: text('what').notNull(),
    trigger: text('trigger'),
    /** 1 (minor) – 5 (major). */
    severity: integer('severity'),
    note: text('note'),
  },
  (t) => [index('slip_ups_goal_idx').on(t.goalId)],
);

/** Denormalized per-goal streaks; recomputable from check_ins + slip_ups. */
export const streaks = sqliteTable('streaks', {
  goalId: integer('goal_id')
    .primaryKey()
    .references(() => goals.id),
  current: integer('current').notNull().default(0),
  longest: integer('longest').notNull().default(0),
  /** Last local day (YYYY-MM-DD) counted into `current`. */
  lastCountedDay: text('last_counted_day'),
});

export const notificationSchedules = sqliteTable('notification_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** Local time of day, 24h `HH:MM`. */
  time: text('time').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  /** Identifier returned by expo-notifications for cancel/reschedule. */
  osIdentifier: text('os_identifier'),
});

/** Settings and flags. */
export const kv = sqliteTable('kv', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
