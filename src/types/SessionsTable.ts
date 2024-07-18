import type { Insertable, Selectable, Updateable } from 'kysely';

export interface SessionsTable {
  id: string;
  user: string;
  expires_at: Date;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;
