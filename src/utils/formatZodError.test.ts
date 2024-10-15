import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { getIssueKey, formatZodError } from './formatZodError.js';
import { ZodError } from 'zod';

describe('getIssueKey', () => {
  it('Formats path array into a string', () => {
    assert.equal(getIssueKey([]), '', 'empty path returns empty string');
    assert.equal(
      getIssueKey(['one']),
      'one',
      'single-element string path returns first element'
    );
    assert.equal(
      getIssueKey([1]),
      '1',
      'single-element number path returns first element as string'
    );
    assert.equal(
      getIssueKey(['one', 'two', 'three']),
      'one[two][three]',
      'multiple-element string path returns stringified path'
    );
    assert.equal(
      getIssueKey([1, 2, 3]),
      '1[2][3]',
      'multiple-element number path returns stringified path'
    );
    assert.equal(
      getIssueKey([1, 'two', 3]),
      '1[two][3]',
      'multiple-element mixed string and number path returns stringified path'
    );
    assert.equal(
      getIssueKey(['one', 2, 'three']),
      'one[2][three]',
      'multiple-element mixed string and number path returns stringified path'
    );
  });
});

describe('formatZodError', () => {
  const emptyIssues = new ZodError([]);
  const oneSimpleIssue = new ZodError([
    {
      code: 'invalid_type',
      expected: 'number',
      received: 'nan',
      path: ['one'],
      message: 'Expected number, received nan'
    }
  ]);
  const severalComplexIssues = new ZodError([
    {
      code: 'custom',
      path: [],
      message: 'Global issue 1'
    },
    {
      code: 'custom',
      path: [],
      message: 'Global issue 2'
    },
    {
      code: 'custom',
      path: [],
      message: 'Global issue 3'
    },
    {
      code: 'custom',
      path: ['one', 'two', 'three'],
      message: 'Nested issue 1'
    },
    {
      code: 'custom',
      path: ['one', 'two', 'three'],
      message: 'Nested issue 2'
    },
    {
      code: 'custom',
      path: ['one', 'two', 'three'],
      message: 'Nested issue 3'
    }
  ]);

  it('Returns formatted issues', () => {
    assert.deepEqual(
      formatZodError(emptyIssues),
      {},
      'empty issues return empty object'
    );
    assert.deepEqual(
      formatZodError(oneSimpleIssue),
      {
        one: ['Expected number, received nan']
      },
      'one issue for one key returns single-element array of message for this key'
    );
    assert.deepEqual(
      formatZodError(severalComplexIssues),
      {
        '': ['Global issue 1', 'Global issue 2', 'Global issue 3'],
        'one[two][three]': [
          'Nested issue 1',
          'Nested issue 2',
          'Nested issue 3'
        ]
      },
      'several issues per key return array of messages per key'
    );
  });
});
