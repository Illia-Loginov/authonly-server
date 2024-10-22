import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import request from 'supertest';
import app from '../app.js';

describe('GET /healthcheck', () => {
  it('Returns a successful response', async () => {
    const response = await request(app).get('/healthcheck');

    assert.equal(response.status, 200, 'status code');
    assert.equal(response.text, 'Ok', 'response text');
  });
});
