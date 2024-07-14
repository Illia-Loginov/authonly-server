import { Migrator } from 'kysely';
import { db } from '../db.js';
import * as path from 'path';
import { ESMFileMigrationProvider } from '../utils/ESMFileMigrationProvider.js';

const migrateToLatest = async () => {
  const migrator = new Migrator({
    db,
    provider: new ESMFileMigrationProvider(
      path.join(import.meta.dirname, '../migrations')
    )
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const result of results || []) {
    if (result.status === 'Success') {
      console.log(
        `Migration "${result.migrationName}" was executed successfully`
      );
    } else if (result.status === 'Error') {
      console.error(`Migration "${result.migrationName}" failed`);
    }
  }

  if (error) {
    console.error('Migration failed', error);
    process.exit(1);
  }

  await db.destroy();
};

migrateToLatest();
