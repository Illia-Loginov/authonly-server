import type { Generated } from 'kysely';

export interface UsersTable {
  id: Generated<string>;
  username: string;
  password: string;
  created_at: Generated<Date>;
}
