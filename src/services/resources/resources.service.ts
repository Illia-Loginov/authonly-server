import { db } from '../../db.js';
import { validateReqUser } from '../users/users.validate.js';
import { validateResourceValue } from './resources.validate.js';

export const createResource = async (payload: any, reqUser: any) => {
  const { value } = validateResourceValue(payload);
  const authenticatedUser = validateReqUser(reqUser, ['id'], true);

  const resource = await db
    .insertInto('resources')
    .values({
      value,
      owner: authenticatedUser.id
    })
    .returning(['id', 'value', 'owner', 'created_at'])
    .executeTakeFirstOrThrow();

  return resource;
};
