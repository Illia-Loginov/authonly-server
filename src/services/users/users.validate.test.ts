import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateUserCreds } from './users.validate.js';
import { assertZodError } from '../../utils/assertZodError.js';
import { userSchemaParams } from '../../config/users.config.js';

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
