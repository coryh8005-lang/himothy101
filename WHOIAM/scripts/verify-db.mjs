/**
 * Verifies the generated Drizzle migrations against a real SQLite database
 * (better-sqlite3, in-memory) — the same SQL expo-sqlite will run on device.
 *
 * Run with: npm run verify:db
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '../src/db/migrations');
const journal = JSON.parse(readFileSync(join(migrationsDir, 'meta/_journal.json'), 'utf8'));

const db = new Database(':memory:');
db.pragma('foreign_keys = ON');

for (const entry of journal.entries) {
  const sql = readFileSync(join(migrationsDir, `${entry.tag}.sql`), 'utf8');
  for (const statement of sql.split('--> statement-breakpoint')) {
    if (statement.trim()) db.exec(statement);
  }
  console.log(`applied ${entry.tag}.sql`);
}

const expectedTables = [
  'goals',
  'vault_rules',
  'unlock_events',
  'check_ins',
  'slip_ups',
  'streaks',
  'notification_schedules',
  'kv',
];
const actualTables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((row) => row.name);

for (const table of expectedTables) {
  if (!actualTables.includes(table)) {
    console.error(`MISSING TABLE: ${table} (found: ${actualTables.join(', ')})`);
    process.exit(1);
  }
}

// Smoke-test the core relationships: goal → vault rule → unlock event,
// plus a check-in, a slip-up, a streak row, a schedule, and a kv flag.
const now = Date.now();
const goalId = db
  .prepare("INSERT INTO goals (kind, title, motivation_text, created_at) VALUES ('quit', 'Less doomscrolling', 'I want my evenings back', ?)")
  .run(now).lastInsertRowid;
const ruleId = db
  .prepare('INSERT INTO vault_rules (goal_id, selection_ref, created_at) VALUES (?, ?, ?)')
  .run(goalId, 'selection:test', now).lastInsertRowid;
db.prepare(
  "INSERT INTO unlock_events (rule_id, intent_text, requested_minutes, granted_at, expires_at) VALUES (?, 'reply to mom', 15, ?, ?)",
).run(ruleId, now, now + 15 * 60_000);
db.prepare('INSERT INTO check_ins (scheduled_for, completed_at, mood, urge, had_slip) VALUES (?, ?, 4, 2, 0)').run(now, now);
db.prepare("INSERT INTO slip_ups (goal_id, occurred_at, what, severity) VALUES (?, ?, 'late-night scroll', 2)").run(goalId, now);
db.prepare('INSERT INTO streaks (goal_id, current, longest) VALUES (?, 3, 7)').run(goalId);
db.prepare("INSERT INTO notification_schedules (time) VALUES ('08:30')").run();
db.prepare("INSERT INTO kv (key, value) VALUES ('onboarding_complete', 'false')").run();

// Foreign keys must be enforced.
let fkFailed = false;
try {
  db.prepare("INSERT INTO unlock_events (rule_id, intent_text, requested_minutes, granted_at, expires_at) VALUES (9999, 'x', 15, 1, 2)").run();
} catch {
  fkFailed = true;
}
if (!fkFailed) {
  console.error('FOREIGN KEYS NOT ENFORCED: inserting an unlock_event for a missing rule succeeded');
  process.exit(1);
}

const unlock = db
  .prepare(
    `SELECT g.title, u.intent_text FROM unlock_events u
     JOIN vault_rules r ON r.id = u.rule_id
     JOIN goals g ON g.id = r.goal_id`,
  )
  .get();
if (unlock.title !== 'Less doomscrolling' || unlock.intent_text !== 'reply to mom') {
  console.error('JOIN CHECK FAILED:', unlock);
  process.exit(1);
}

console.log(`ok — ${expectedTables.length} tables created, inserts + joins + FK enforcement verified`);
