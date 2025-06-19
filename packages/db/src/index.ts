import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'server-only';

import { env } from '@workspace/env/server';

import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL, { prepare: false });
if (env.NODE_ENV !== 'production') globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
export type DB = typeof db;
