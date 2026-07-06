import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// Local-first: one on-device database, opened once for the app's lifetime.
// enableChangeListener powers drizzle's useLiveQuery on every screen.
export const expoDb = openDatabaseSync('whoiam.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });
