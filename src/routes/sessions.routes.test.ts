import { after, before, describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { cookieName } from '../config/sessions.config.js';
import { db } from '../db.js';
import { fullUserSchema } from '../services/users/users.validate.js';
import { assertCookie } from '../utils/assertCookie.js';
import { randomUUID } from 'node:crypto';

describe('POST /sessions', () => {
  const user = {
    username: randomUUID().replaceAll('-', ''),
    password: randomUUID(),
    id: ''
  };

  before(async () => {
    const response = await request(app).post('/users').send({
      username: user.username,
      password: user.password
    });

    const id = response.body?.user?.id;
    assert.ok(typeof id === 'string', 'POST /users did not return id');
    user.id = id;

    await db.deleteFrom('sessions').where('user', '=', user.id).execute();
  });

  it('Successfully logges in on valid input', async () => {
    const expectedCreatedAt = Date.now();
    const response = await request(app).post('/sessions').send({
      username: user.username,
      password: user.password
    });

    assert.equal(response.status, 201, 'Invalid status code');

    const { user: responseUser } = response.body;

    assert.deepEqual(
      responseUser,
      fullUserSchema
        .pick({ id: true, username: true, created_at: true })
        .parse(responseUser),
      'Invalid response body'
    );

    assert.equal(responseUser.username, user.username, 'Invalid username');
    assert.equal(responseUser.id, user.id, 'Invalid id');

    const cookie = response
      .get('Set-Cookie')
      ?.find((cookie) => cookie.startsWith(cookieName));

    assert.ok(cookie, 'No valid session token cookie returned');
    assertCookie(cookie, expectedCreatedAt);

    const createdSessionsCount = await db
      .selectFrom('sessions')
      .select(({ fn }) => [fn.countAll().as('count')])
      .where('user', '=', responseUser.id)
      .execute();

    assert.equal(
      Number(createdSessionsCount[0]?.count),
      1,
      'More/less than 1 session created'
    );
  });

  after(async () => {
    await db.deleteFrom('users').where('id', '=', user.id).execute();
  });
});

after(async () => {
  await db.destroy();
});
