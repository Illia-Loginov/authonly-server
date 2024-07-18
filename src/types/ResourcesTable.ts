import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ResourcesTable {
  id: Generated<string>;
  value: string;
  owner: string;
  public: boolean;
  created_at: Generated<Date>;
}

export type Resource = Selectable<ResourcesTable>;
export type NewResource = Insertable<ResourcesTable>;
export type ResourceUpdate = Updateable<ResourcesTable>;
