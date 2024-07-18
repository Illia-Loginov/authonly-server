import type { ResourcesTable } from './ResourcesTable.js';
import type { SessionsTable } from './SessionsTable.js';
import type { UsersTable } from './UsersTable.js';

export interface Database {
  users: UsersTable;
  resources: ResourcesTable;
  sessions: SessionsTable;
}
