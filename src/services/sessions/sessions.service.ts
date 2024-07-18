import { verify } from 'argon2';
import { db } from '../../db.js';
import { UnauthenticatedError } from '../../utils/StatusError.js';
import { validateUserCreds } from '../users/users.validate.js';
import { randomBytes } from 'crypto';
import { ttl } from '../../config/sessions.config.js';
import { validateSessionCookie } from './sessions.validate.js';
import { ZodError } from 'zod';
import type { Database } from '../../types/Database.js';
import type { AnyColumn } from 'kysely';
import type { SelectExpression } from 'kysely';

export const createSession = async (userId: string) => {
  return await db
    .insertInto('sessions')
    .values({
      id: randomBytes(32).toString('hex'),
      user: userId,
      expires_at: new Date(Date.now() + ttl)
    })
    .returning(['id', 'expires_at'])
    .executeTakeFirstOrThrow();
};

export const logIn = async (payload: any) => {
  const creds = validateUserCreds(payload);

  const user = await db
    .selectFrom('users')
    .select(['id', 'username', 'created_at', 'password'])
    .where('username', '=', creds.username)
    .executeTakeFirstOrThrow(() => {
      throw new UnauthenticatedError('Invalid username or password');
    });

  if (!(await verify(user.password, creds.password))) {
    throw new UnauthenticatedError('Invalid username or password');
  }

  const session = await createSession(user.id);

  return {
    session,
    user: {
      id: user.id,
      username: user.username,
      created_at: user.created_at
    }
  };
};

export const deleteSession = async (payload: any) => {
  try {
    const sessionId = validateSessionCookie(payload);

    await db.deleteFrom('sessions').where('id', '=', sessionId).execute();
  } catch (error) {
    if (error instanceof ZodError) {
      return;
    }

    throw error;
  }
};

export const getUserBySessionId = async (
  payload: any,
  userProperties: AnyColumn<Database, 'users'>[]
) => {
  const sessionId = validateSessionCookie(payload);

  const user = await db
    .selectFrom('sessions')
    .innerJoin('users', 'users.id', 'sessions.user')
    .select(
      userProperties.map(
        (prop): SelectExpression<Database, 'users'> =>
          `users.${prop} as ${prop}`
      )
    )
    .where('sessions.id', '=', sessionId)
    .where('sessions.expires_at', '>', new Date())
    .executeTakeFirstOrThrow(() => {
      throw new UnauthenticatedError('No valid session token cookie provided');
    });

  return user;
};
