import { hash } from 'argon2';
import { validateUserCreds } from './users.validate.js';
import { db } from '../../db.js';

export const createUser = async (payload: any) => {
  const creds = validateUserCreds(payload);

  const hashedPassword = await hash(creds.password);

  const user = await db
    .insertInto('users')
    .values({
      ...creds,
      password: hashedPassword
    })
    .returning(['id', 'username', 'created_at'])
    .executeTakeFirstOrThrow();

  return user;
};
