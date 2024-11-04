import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { toCapitalized } from './stringFormatting.js';

describe('toCapitalized', () => {
  it('Returns capitalized string', () => {
    assert.equal(toCapitalized('hello'), 'Hello');
    assert.equal(toCapitalized('a'), 'A');
    assert.equal(toCapitalized('hello world'), 'Hello world');
  });

  it('Does not mutate input that does not start with a lowercase letter', () => {
    assert.equal(toCapitalized(''), '');
    assert.equal(toCapitalized(' hello'), ' hello');
    assert.equal(toCapitalized('123'), '123');
    assert.equal(toCapitalized('HELLO'), 'HELLO');
  });
});
