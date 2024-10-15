import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { handleDbError } from './handleDbError.js';
import pg from 'pg';
import { BadRequestError } from './StatusError.js';

describe('handleDbError', () => {
  it('Parses and formats unique restraint pg.DatabaseError', () => {
    const dbError = new pg.DatabaseError(
      'duplicate key value violates unique constraint "users_username_key"',
      0,
      'error'
    );
    dbError.code = '23505';
    dbError.detail = 'Key (key)=(VALUE) already exists.';

    const result = handleDbError(dbError);

    assert.ok(result instanceof BadRequestError, 'is BadRequestError');
    assert.equal(
      result.message,
      `key "VALUE" already exists`,
      'has correct message'
    );
  });

  it('Returns arbitrary pg.DatabaseError unchanged', () => {
    const dbError = new pg.DatabaseError('message', 0, 'error');
    dbError.code = '404';
    dbError.detail = 'detail';

    const result = handleDbError(dbError);

    assert.deepEqual(dbError, result, 'input is unchanged');
  });
});
