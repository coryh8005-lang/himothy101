/**
 * Check-in reminder scheduling (expo-notifications, local only).
 *
 * Three repeating daily triggers — uses 3 of iOS's 64 pending-notification
 * slots. `notification_schedules` is the source of truth; `applySchedules`
 * reconciles the OS's scheduled notifications with it.
 */

import * as Notifications from 'expo-notifications';
import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { notificationSchedules } from '@/db/schema';

export const CHECKIN_CATEGORY = 'checkin';

const DEFAULT_TIMES = ['08:30', '14:30', '21:00'];

const REMINDER_COPY = [
  { title: 'Morning check-in', body: 'How are you starting the day? 30 seconds of honesty.' },
  { title: 'Midday check-in', body: 'Pause for a moment — how is it actually going?' },
  { title: 'Evening check-in', body: 'Close the day honestly. Wins and slips both count.' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function hasNotificationPermission(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Seed the three default schedule rows on first use. */
export async function ensureDefaultSchedules() {
  const existing = await db.select().from(notificationSchedules);
  if (existing.length > 0) return;
  await db
    .insert(notificationSchedules)
    .values(DEFAULT_TIMES.map((time) => ({ time, enabled: true })));
}

export function parseTime(time: string): { hour: number; minute: number } {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return { hour, minute };
}

/**
 * Reconcile OS notifications with the schedules table: cancel every
 * previously registered reminder, then re-schedule the enabled rows and
 * store the new OS identifiers.
 */
export async function applySchedules() {
  const rows = await db.select().from(notificationSchedules);

  for (const row of rows) {
    if (row.osIdentifier) {
      await Notifications.cancelScheduledNotificationAsync(row.osIdentifier).catch(() => {});
    }
  }

  const granted = await hasNotificationPermission();
  const sorted = [...rows].sort((a, b) => a.time.localeCompare(b.time));

  for (const [i, row] of sorted.entries()) {
    let osIdentifier: string | null = null;
    if (granted && row.enabled) {
      const { hour, minute } = parseTime(row.time);
      const copy = REMINDER_COPY[Math.min(i, REMINDER_COPY.length - 1)];
      osIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: copy.title,
          body: copy.body,
          categoryIdentifier: CHECKIN_CATEGORY,
          data: { url: '/checkin/new' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
    await db
      .update(notificationSchedules)
      .set({ osIdentifier })
      .where(eq(notificationSchedules.id, row.id));
  }
}

export async function setScheduleTime(id: number, time: string) {
  await db.update(notificationSchedules).set({ time }).where(eq(notificationSchedules.id, id));
  await applySchedules();
}

export async function setScheduleEnabled(id: number, enabled: boolean) {
  await db.update(notificationSchedules).set({ enabled }).where(eq(notificationSchedules.id, id));
  await applySchedules();
}
