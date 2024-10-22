import { after, describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { fullUserSchema } from '../services/users/users.validate.js';
import { db } from '../db.js';

describe('POST /users', () => {
  const uniqueValidUserCreds = {
    username: Date.now().toString(),
    password: Date.now().toString()
  };

  it('Successfully creates and returns a new user on valid input', async () => {
    const expectedCreatedAt = Date.now();
    const response = await request(app)
      .post('/users')
      .send(uniqueValidUserCreds)
      .set('Accept', 'application/json');

    assert.equal(response.status, 201, 'Invalid status code');

    const { user: responseUser } = response.body;

    assert.deepEqual(
      responseUser,
      fullUserSchema
        .pick({ id: true, username: true, created_at: true })
        .parse(responseUser),
      'Invalid response body'
    );

    assert.equal(
      responseUser.username,
      uniqueValidUserCreds.username,
      'Invalid username'
    );

    assert.ok(
      Math.abs(
        new Date(responseUser.created_at).getTime() - expectedCreatedAt
      ) <
        60 * 60 * 1000,
      'Invalid created_at'
    );

    const createdUsers = await db
      .selectFrom('users')
      .select('password')
      .where('id', '=', responseUser.id)
      .where('username', '=', uniqueValidUserCreds.username)
      .limit(2)
      .execute();

    assert.equal(createdUsers.length, 1, 'More/less than 1 user created');

    assert.notEqual(
      createdUsers[0],
      uniqueValidUserCreds.password,
      'Password is stored as is'
    );
  });

  after(async () => {
    await db
      .deleteFrom('users')
      .where('username', '=', uniqueValidUserCreds.username)
      .execute();

    await db.destroy();
  });
});
