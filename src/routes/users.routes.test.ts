import { after, before, describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { fullUserSchema } from '../services/users/users.validate.js';
import { db } from '../db.js';
import { cookieName, ttl } from '../config/sessions.config.js';
import { userSchemaParams } from '../config/users.config.js';

describe('POST /users', () => {
  const uniqueValidUserCreds = {
    username: Date.now().toString(),
    password: Date.now().toString()
  };

  let sessionId: string | undefined;

  it('Successfully creates and returns a new user on valid input', async () => {
    const expectedCreatedAt = Date.now();
    const response = await request(app)
      .post('/users')
      .send(uniqueValidUserCreds);

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

    const cookie = response
      .get('Set-Cookie')
      ?.find((cookie) => cookie.startsWith(cookieName));

    assert.ok(cookie, 'No valid session token cookie returned');
    assert.ok(cookie.includes('HttpOnly'), 'Cookie is not HttpOnly');
    assert.ok(cookie.includes('Secure'), 'Cookie is not secure');
    assert.ok(
      cookie.includes('SameSite=Strict'),
      'Cookie is not SameSite=Strict'
    );
    assert.ok(cookie.includes('Path=/'), 'Cookie is not in /');

    const expires = cookie.match(/Expires=([^;]+);/)?.[1];
    assert.ok(expires, 'No expires string in cookie');

    assert.ok(
      Math.abs(new Date(expires).getTime() - expectedCreatedAt - ttl) <
        10 * 60 * 1000,
      'Invalid expires date'
    );

    const createdSessions = await db
      .selectFrom('sessions')
      .select('id')
      .where('user', '=', responseUser.id)
      .limit(2)
      .execute();
    assert.equal(createdSessions.length, 1, 'More/less than 1 session created');
    sessionId = createdSessions[0]?.id;

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

  it('Rejects duplicate user creation', async () => {
    const response = await request(app)
      .post('/users')
      .send(uniqueValidUserCreds)
      .set('Accept', 'application/json');

    assert.equal(response.status, 400, 'Invalid status code');

    const createdUsers = await db
      .selectFrom('users')
      .where('username', '=', uniqueValidUserCreds.username)
      .limit(2)
      .execute();

    assert.equal(createdUsers.length, 1, 'Duplicate user created');
  });

  it('Rejects invalid input', async () => {
    const response = await request(app).post('/users').send({
      username: true,
      password: '',
      extraField: -1
    });

    assert.equal(response.status, 400, 'Invalid status code');

    const { message, issues } = response.body;

    assert.equal(message, 'Invalid input', 'Invalid message');
    assert.deepEqual(issues, {
      username: ['Expected string, received boolean'],
      password: [
        `String must contain at least ${userSchemaParams.password.min} character(s)`
      ],
      '': [`Unrecognized key(s) in object: 'extraField'`]
    });
  });

  after(async () => {
    await db
      .deleteFrom('users')
      .where('username', '=', uniqueValidUserCreds.username)
      .execute();

    if (sessionId)
      await db.deleteFrom('sessions').where('id', '=', sessionId).execute();
  });
});

describe('GET /users', () => {
  const uniqueValidUserCreds = {
    username: Date.now().toString(),
    password: Date.now().toString()
  };

  let cookie: string | undefined;

  it('Rejects, when not authenticated', async () => {
    const response = await request(app).get('/users');

    assert.equal(response.status, 401, 'Invalid status code');
    assert.equal(
      response.body.message,
      'No valid session token cookie provided'
    );
  });

  it('Rejects, when using incorrect session token', async () => {
    const response = await request(app)
      .get('/users')
      .set('Cookie', [`${cookieName}=incorrect_session_token`]);

    assert.equal(response.status, 401, 'Invalid status code');
    assert.equal(
      response.body.message,
      'No valid session token cookie provided'
    );
  });

  it('Returns current user, when logged in', async () => {
    const signUpResponse = await request(app)
      .post('/users')
      .send(uniqueValidUserCreds);

    cookie = signUpResponse
      .get('Set-Cookie')
      ?.find((cookie) => cookie.startsWith(cookieName));

    assert.ok(cookie, 'No valid session token cookie returned');

    const whoamiResponse = await request(app)
      .get('/users')
      .set('Cookie', [cookie]);

    assert.equal(whoamiResponse.status, 200, 'Invalid status code');

    const { user: responseUser } = whoamiResponse.body;

    assert.deepEqual(
      responseUser,
      fullUserSchema.pick({ id: true, username: true }).parse(responseUser),
      'Invalid response body'
    );

    assert.equal(
      responseUser.username,
      uniqueValidUserCreds.username,
      'Invalid username'
    );

    await db
      .deleteFrom('sessions')
      .where('user', '=', responseUser.id)
      .execute();
  });

  it('Rejects, when using expired session token', async () => {
    assert.ok(cookie, 'No session token cookie');

    const response = await request(app).get('/users').set('Cookie', [cookie]);

    assert.equal(response.status, 401, 'Invalid status code');
    assert.equal(
      response.body.message,
      'No valid session token cookie provided'
    );
  });

  after(async () => {
    await db
      .deleteFrom('users')
      .where('username', '=', uniqueValidUserCreds.username)
      .execute();
  });
});

describe('DELETE /users/:id', async () => {
  const users: { cookie: string; id: string }[] = [];

  before(async () => {
    for (let userIndex = 0; userIndex < 2; userIndex++) {
      const response = await request(app)
        .post('/users')
        .send({
          username: `${Date.now()}_${userIndex}`,
          password: Date.now().toString()
        });

      const cookie = response
        .get('Set-Cookie')
        ?.find((cookie) => cookie.startsWith(cookieName));

      const id = response.body?.user?.id;

      assert.ok(
        typeof cookie === 'string',
        'POST /users did not return cookie'
      );
      assert.ok(typeof id === 'string', 'POST /users did not return id');

      users.push({ cookie, id });
    }
  });

  it('Rejects, when not authenticated', async () => {
    const response = await request(app).delete(`/users/${users[1]?.id}`);

    assert.equal(response.status, 401, 'Invalid status code');
    assert.equal(
      response.body.message,
      'No valid session token cookie provided'
    );
  });

  it('Rejects, when using incorrect session token', async () => {
    const response = await request(app)
      .delete(`/users/${users[1]?.id}`)
      .set('Cookie', [`${cookieName}=incorrect_session_token`]);

    assert.equal(response.status, 401, 'Invalid status code');
    assert.equal(
      response.body.message,
      'No valid session token cookie provided'
    );
  });

  it('Rejects, when trying to delete another user', async () => {
    const response = await request(app)
      .delete(`/users/${users[1]?.id}`)
      .set('Cookie', [users[0]?.cookie || '']);

    assert.equal(response.status, 403, 'Invalid status code');
    assert.equal(response.body.message, 'Cannot delete other users');
  });

  it('Rejects, when using invalid id', async () => {
    const response = await request(app)
      .delete(`/users/INVALID_ID`)
      .set('Cookie', [users[0]?.cookie || '']);

    assert.equal(response.status, 400, 'Invalid status code');

    const { message, issues } = response.body;

    assert.equal(message, 'Invalid input', 'Invalid message');
    assert.deepEqual(issues, {
      id: ['Invalid uuid']
    });
  });

  it('Deletes users on valid input', async () => {
    for (const { cookie, id } of users) {
      const response = await request(app)
        .delete(`/users/${id}`)
        .set('Cookie', [cookie]);

      assert.equal(response.status, 200, 'Invalid status code');

      const { user: responseUser } = response.body;

      assert.deepEqual(
        responseUser,
        fullUserSchema
          .pick({ id: true, username: true, created_at: true })
          .parse(responseUser),
        'Invalid response body'
      );

      assert.equal(responseUser.id, id, 'Invalid id');
    }

    const ids = users.map(({ id }) => id);

    const [nonDeletedUsersCount, nonDeletedSessionsCount] = await Promise.all([
      db
        .selectFrom('users')
        .select(({ fn }) => [fn.countAll().as('count')])
        .where('id', 'in', ids)
        .execute(),
      db
        .selectFrom('sessions')
        .select(({ fn }) => [fn.countAll().as('count')])
        .where('user', 'in', ids)
        .execute()
    ]);

    assert.equal(
      Number(nonDeletedUsersCount[0]?.count),
      0,
      'Users were not deleted'
    );
    assert.equal(
      Number(nonDeletedSessionsCount[0]?.count),
      0,
      'Sessions were not deleted'
    );
  });

  after(async () => {
    const ids = users.map(({ id }) => id);

    await db.deleteFrom('users').where('id', 'in', ids).execute();
    await db.deleteFrom('sessions').where('user', 'in', ids).execute();
  });
});

after(async () => {
  await db.destroy();
});
