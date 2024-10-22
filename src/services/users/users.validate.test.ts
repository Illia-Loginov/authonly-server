import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  validateReqUser,
  validateUserCreds,
  validateUserId,
  type FullUserSchema
} from './users.validate.js';
import { assertZodError } from '../../utils/assertZodError.js';
import { userSchemaParams } from '../../config/users.config.js';

const validUuid = '2dbf6a88-7fb1-4f89-9372-3a3823a6952f';

describe('validateUserCreds', () => {
  it('Returns valid input', () => {
    const simpleMinLength = { username: 'a', password: 'b' };
    const simpleMaxLength = {
      username: 'a'.repeat(32),
      password: 'b'.repeat(64)
    };
    const complexMaxLength = {
      username: 'MdhL_Yc_uGYuTcXJTApP4ScuL7LigGJR',
      password: `W@;Yv#nMWmAz3.PK<R"Ss3=h</g2'.&CbF*-/EDE|BHn{:|vz5(Z4v.g#yAEhY|3`
    };

    assert.deepEqual(
      validateUserCreds(simpleMinLength),
      simpleMinLength,
      'simple characters, min length'
    );
    assert.deepEqual(
      validateUserCreds(simpleMaxLength),
      simpleMaxLength,
      'simple characters, max length'
    );
    assert.deepEqual(
      validateUserCreds(complexMaxLength),
      complexMaxLength,
      'complex characters, max length'
    );
  });

  it('Throws on invalid input', () => {
    assert.throws(
      () => validateUserCreds(null),
      assertZodError([
        {
          code: 'invalid_type',
          expected: 'object',
          received: 'null',
          path: [],
          message: 'Expected object, received null'
        }
      ]),
      'null'
    );

    assert.throws(
      () => validateUserCreds({}),
      assertZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['username'],
          message: 'Required'
        },
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['password'],
          message: 'Required'
        }
      ]),
      'empty object'
    );

    assert.throws(
      () => validateUserCreds({ username: '', password: '' }),
      assertZodError([
        {
          code: 'too_small',
          minimum: userSchemaParams.username.min,
          inclusive: true,
          exact: false,
          type: 'string',
          path: ['username'],
          message: 'String must contain at least 1 character(s)'
        },
        {
          code: 'too_small',
          minimum: userSchemaParams.password.min,
          inclusive: true,
          exact: false,
          type: 'string',
          path: ['password'],
          message: 'String must contain at least 1 character(s)'
        }
      ]),
      'empty string username and password'
    );

    assert.throws(
      () =>
        validateUserCreds({
          username: 'a'.repeat(userSchemaParams.username.max + 1),
          password: 'b'.repeat(userSchemaParams.password.max + 1)
        }),
      assertZodError([
        {
          code: 'too_big',
          maximum: userSchemaParams.username.max,
          inclusive: true,
          exact: false,
          type: 'string',
          path: ['username'],
          message: 'String must contain at most 32 character(s)'
        },
        {
          code: 'too_big',
          maximum: userSchemaParams.password.max,
          inclusive: true,
          exact: false,
          type: 'string',
          path: ['password'],
          message: 'String must contain at most 64 character(s)'
        }
      ]),
      'username and password too long'
    );

    assert.throws(
      () => validateUserCreds({ username: 'кирилиця', password: 'кирилиця' }),
      assertZodError([
        {
          code: 'invalid_string',
          validation: 'regex',
          path: ['username'],
          message: 'Contains forbidden characters'
        },
        {
          code: 'invalid_string',
          validation: 'regex',
          path: ['password'],
          message: 'Contains forbidden characters'
        }
      ]),
      'username and password with forbidden characters'
    );
  });
});

describe('validateUserId', () => {
  it('Returns valid input', () => {
    assert.deepEqual(
      validateUserId({ id: validUuid }),
      { id: validUuid },
      'valid UUID'
    );
  });

  it('Throws on invalid input', () => {
    assert.throws(
      () => validateUserId(null),
      assertZodError([
        {
          code: 'invalid_type',
          expected: 'object',
          received: 'null',
          path: [],
          message: 'Expected object, received null'
        }
      ]),
      'null'
    );

    assert.throws(
      () => validateUserId({}),
      assertZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['id'],
          message: 'Required'
        }
      ]),
      'empty object'
    );

    assert.throws(
      () => validateUserId({ id: 'Invalid UUID' }),
      assertZodError([
        {
          code: 'invalid_string',
          validation: 'uuid',
          path: ['id'],
          message: 'Invalid uuid'
        }
      ]),
      'invalid UUID'
    );
  });
});

describe('validateReqUser', () => {
  it('Returns valid input', () => {
    assert.deepEqual(
      validateReqUser({ id: validUuid }, ['id']),
      { id: validUuid },
      'valid user id'
    );

    assert.deepEqual(
      validateReqUser({ id: validUuid }, ['id'], false),
      { id: validUuid },
      'valid user id (not required)'
    );

    const fullValidUser: FullUserSchema = {
      id: validUuid,
      username: 'a',
      password: 'b',
      created_at: new Date().toISOString()
    };

    assert.deepEqual(
      validateReqUser(fullValidUser, [
        'id',
        'username',
        'password',
        'created_at'
      ]),
      fullValidUser,
      'valid user id'
    );

    assert.deepEqual(
      validateReqUser(
        fullValidUser,
        ['id', 'username', 'password', 'created_at'],
        false
      ),
      fullValidUser,
      'valid user id (not required)'
    );
  });

  it('Returns null on invalid input, if not required', () => {
    assert.equal(validateReqUser(null, ['id'], false), null, 'null');
    assert.equal(validateReqUser({}, ['id'], false), null, 'empty object');
    assert.equal(
      validateReqUser({ id: 'Invalid UUID' }, ['id'], false),
      null,
      'invalid user'
    );
  });

  it('Throws on invalid input, if required', () => {
    assert.throws(
      () => validateReqUser(null, ['id']),
      /middleware is required on this route/,
      'null'
    );

    assert.throws(
      () => validateReqUser({}, ['id']),
      /middleware is required on this route/,
      'empty object'
    );

    assert.throws(
      () => validateReqUser({ id: 'Invalid UUID' }, ['id']),
      /middleware is required on this route/,
      'invalid user'
    );
  });
});
