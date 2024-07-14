// Modified FileMigrationProvider from kysely to properly work with TypeScript and ESM

import type { Migration, MigrationProvider } from 'kysely';
import path from 'path';
import { promises as fs } from 'fs';

const fileNamesFilter = /^.+(?<!\.d)\.m?[jt]s$/;

const isMigration = (obj: unknown): obj is Migration => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'up' in obj &&
    typeof obj.up === 'function'
  );
};

export class ESMFileMigrationProvider implements MigrationProvider {
  constructor(private absolutePath: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};

    const files = await fs.readdir(this.absolutePath);
    const relativePath = path.relative(import.meta.dirname, this.absolutePath);

    for (const fileName of files) {
      if (!fileNamesFilter.test(fileName)) {
        continue;
      }

      const importPath = path
        .join(relativePath, fileName)
        .replaceAll('\\', '/');

      const migration = await import(importPath);
      const key = fileName.substring(0, fileName.lastIndexOf('.'));

      if (isMigration(migration?.default)) {
        migrations[key] = migration.default;
      } else if (isMigration(migration)) {
        migrations[key] = migration;
      }
    }

    return migrations;
  }
}
