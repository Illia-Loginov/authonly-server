import { hash } from 'argon2';
import { validateCreateUser } from './users.validate.js';
import { db } from '../../db.js';

export const createUser = async (payload: any) => {
  const data = validateCreateUser(payload);

  const hashedPassword = await hash(data.password);

  const user = await db
    .insertInto('users')
    .values({
      ...data,
      password: hashedPassword
    })
    .returning(['id', 'username', 'created_at'])
    .executeTakeFirst();

  return user;
};
