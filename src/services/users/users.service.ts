import { hash } from 'argon2';
import {
  validateReqUser,
  validateUserCreds,
  validateUserId
} from './users.validate.js';
import { db } from '../../db.js';
import { createSession } from '../sessions/sessions.service.js';
import { ForbiddenError, NotFoundError } from '../../utils/StatusError.js';

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

  const session = await createSession(user.id);

  return {
    session,
    user
  };
};

export const deleteUser = async (payload: any, reqUser: any) => {
  const { id } = validateUserId(payload);
  const authenticatedUser = validateReqUser(reqUser, ['id'], true);

  if (id !== authenticatedUser.id) {
    throw new ForbiddenError('Cannot delete other users');
  }

  const deletedUser = await db
    .deleteFrom('users')
    .where('id', '=', id)
    .returning(['id', 'username', 'created_at'])
    .executeTakeFirstOrThrow(() => {
      throw new NotFoundError('User already deleted');
    });

  return deletedUser;
};
