import type { Generated } from 'kysely';

export interface ResourcesTable {
  id: Generated<string>;
  value: string;
  owner: string;
  public: boolean;
  created_at: Generated<Date>;
}
