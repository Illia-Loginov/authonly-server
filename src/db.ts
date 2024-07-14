import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import pgPoolConfig from './config/db.config.js';
import type { Database } from './types/Database.js';

const dialect = new PostgresDialect({
  pool: new pg.Pool(pgPoolConfig)
});

export const db = new Kysely<Database>({ dialect });
