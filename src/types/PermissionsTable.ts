import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PermissionsTable {
  id: Generated<string>;
  resource: string;
  user: string;
  read: boolean;
  write: boolean;
  created_at: Generated<Date>;
}

export type Permission = Selectable<PermissionsTable>;
export type NewPermission = Insertable<PermissionsTable>;
export type PermissionUpdate = Updateable<PermissionsTable>;
