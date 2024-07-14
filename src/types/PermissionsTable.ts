import type { Generated } from 'kysely';

export interface PermissionsTable {
  id: Generated<string>;
  resource: string;
  user: string;
  read: boolean;
  write: boolean;
  created_at: Generated<Date>;
}
