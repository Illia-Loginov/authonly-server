import type { OrderByExpression } from 'kysely';
import { db } from '../../db.js';
import { ForbiddenError } from '../../utils/StatusError.js';
import { validateReqUser } from '../users/users.validate.js';
import {
  validateListResources,
  validateResourceId,
  validateResourceValue
} from './resources.validate.js';
import type { Database } from '../../types/Database.js';
import type { Selection } from 'kysely';
import type { AnyColumn } from 'kysely';

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

export const getResources = async (payload: any) => {
  const { offset, limit, sort } = validateListResources(payload);

  const selectedColumns = ['id', 'value', 'owner', 'created_at'] as const;

  const sortArray = Object.entries(sort).map(
    ([column, order]): OrderByExpression<
      Database,
      'resources',
      Selection<Database, 'resources', (typeof selectedColumns)[number]>
    > => `${column as AnyColumn<Database, 'resources'>} ${order}`
  );

  const resources = await db
    .selectFrom('resources')
    .select(selectedColumns)
    .offset(offset)
    .limit(limit)
    .orderBy(sortArray)
    .execute();

  return resources;
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

export const editResource = async (
  reqBody: any,
  reqParams: any,
  reqUser: any
) => {
  const patch = validateResourceValue(reqBody);
  const { id } = validateResourceId(reqParams);
  const authenticatedUser = validateReqUser(reqUser, ['id'], true);

  const resource = await db
    .updateTable('resources')
    .set(patch)
    .where('id', '=', id)
    .where('owner', '=', authenticatedUser.id)
    .returning(['id', 'value', 'owner', 'created_at'])
    .executeTakeFirstOrThrow(() => {
      throw new ForbiddenError('Can only edit owned resources');
    });

  return resource;
};
