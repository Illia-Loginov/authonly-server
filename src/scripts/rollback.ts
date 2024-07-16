import { Migrator, NO_MIGRATIONS } from 'kysely';
import { db } from '../db.js';
import * as path from 'path';
import { ESMFileMigrationProvider } from '../utils/ESMFileMigrationProvider.js';

const rollback = async () => {
  const migrator = new Migrator({
    db,
    provider: new ESMFileMigrationProvider(
      path.join(import.meta.dirname, '../migrations')
    )
  });

  const { error, results } = await migrator.migrateTo(NO_MIGRATIONS);

  for (const result of results || []) {
    if (result.status === 'Success') {
      console.log(
        `Migration "${result.migrationName}" was rolled back successfully`
      );
    } else if (result.status === 'Error') {
      console.error(`Rollback fof migration "${result.migrationName}" failed`);
    }
  }

  if (error) {
    console.error('Rollback failed', error);
    process.exit(1);
  }

  await db.destroy();
};

rollback();
