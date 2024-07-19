import { Kysely, sql } from 'kysely';

export const up = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('username', 'varchar(32)', (col) => col.unique().notNull())
    .addColumn('password', 'varchar(128)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`)
    )
    .execute();

  await db.schema
    .createTable('resources')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('value', 'varchar(256)', (col) => col.notNull())
    .addColumn('owner', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`)
    )
    .execute();

  await db.schema
    .createTable('sessions')
    .ifNotExists()
    .addColumn('id', 'varchar(64)', (col) => col.primaryKey().notNull())
    .addColumn('user', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .execute();
};

export const down = async (db: Kysely<any>): Promise<void> => {
  await db.schema.dropTable('sessions').ifExists().execute();
  await db.schema.dropTable('resources').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();
};
