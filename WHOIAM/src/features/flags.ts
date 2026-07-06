import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { kv } from '@/db/schema';

export const ONBOARDING_COMPLETE = 'onboarding_complete';

/** Synchronous read — used for render-time routing decisions (tiny kv table). */
export function isFlagSet(key: string): boolean {
  const row = db.select().from(kv).where(eq(kv.key, key)).all()[0];
  return row?.value === 'true';
}

export async function setFlag(key: string, value: boolean) {
  await db
    .insert(kv)
    .values({ key, value: String(value) })
    .onConflictDoUpdate({ target: kv.key, set: { value: String(value) } });
}
