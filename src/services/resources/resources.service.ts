import { db } from '../../db.js';
import { ForbiddenError } from '../../utils/StatusError.js';
import { validateReqUser } from '../users/users.validate.js';
import {
  validateListResources,
  validateResourceId,
  validateResourceValue
} from './resources.validate.js';

const sortObjectToArray = <T extends string>(sort: Record<T, 'asc' | 'desc'>) =>
  Object.entries(sort).map(
    ([column, order]): `${T} ${'asc' | 'desc'}` =>
      `${column as T} ${order as 'asc' | 'desc'}`
  );

export const createResource = async (payload: any, reqUser: any) => {
  const { value } = validateResourceValue(payload);
  const authenticatedUser = validateReqUser(reqUser, ['id'], true);

  const resource = await db
    .insertInto('resources')
    .values({
      value,
      owner: authenticatedUser.id
    })
    .returning(['id', 'value', 'created_at'])
    .executeTakeFirstOrThrow();

  return resource;
};

export const getResources = async (payload: any) => {
  const { offset, limit, sort } = validateListResources(payload);

  const selectedColumns = [
    'resources.id as id',
    'resources.value as value',
    'resources.created_at as created_at',
    'users.id as owner_id',
    'users.username as owner_username'
  ] as const;

  const [resources, rowCount] = await Promise.all([
    await db
      .selectFrom('resources')
      .innerJoin('users', 'users.id', 'resources.owner')
      .select(selectedColumns)
      .offset(offset)
      .limit(limit)
      .orderBy(sortObjectToArray(sort))
      .execute(),
    await db
      .selectFrom('resources')
      .select(({ fn }) => fn.countAll().as('count'))
      .execute()
  ]);

  return {
    resources,
    isLast: offset + limit >= (Number(rowCount?.[0]?.count) || 0)
  };
};

export const deleteResource = async (payload: any, reqUser: any) => {
  const { id } = validateResourceId(payload);
  const authenticatedUser = validateReqUser(reqUser, ['id'], true);

  const deletedResource = await db
    .deleteFrom('resources')
    .where('id', '=', id)
    .where('owner', '=', authenticatedUser.id)
    .returning(['id', 'value', 'created_at'])
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
    .returning(['id', 'value', 'created_at'])
    .executeTakeFirstOrThrow(() => {
      throw new ForbiddenError('Can only edit owned resources');
    });

  return resource;
};
