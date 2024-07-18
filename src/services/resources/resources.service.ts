import { db } from '../../db.js';
import { ForbiddenError } from '../../utils/StatusError.js';
import { validateReqUser } from '../users/users.validate.js';
import {
  validateResourceId,
  validateResourceValue
} from './resources.validate.js';

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

export const deleteResource = async (payload: any, reqUser: any) => {
  const { id } = validateResourceId(payload);
  const authenticatedUser = validateReqUser(reqUser, ['id'], true);

  const deletedResource = await db
    .deleteFrom('resources')
    .where('id', '=', id)
    .where('owner', '=', authenticatedUser.id)
    .returning(['id', 'value', 'owner', 'created_at'])
    .executeTakeFirstOrThrow(() => {
      throw new ForbiddenError('Can only delete owned resources');
    });

  return deletedResource;
};
