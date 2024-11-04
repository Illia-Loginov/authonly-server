import type { CookieOptions } from 'express';
import { strict as assert } from 'node:assert';
import { toCapitalized } from './stringFormatting.js';
import { cookieOptions, ttl } from '../config/sessions.config.js';

type AssertionFunction<Option extends keyof CookieOptions> = (
  cookie: string,
  value: CookieOptions[Option]
) => void;

const cookieOptionsAssertions: {
  [Option in keyof CookieOptions]?: AssertionFunction<Option>;
} = {
  httpOnly: (cookie: string, httpOnly: boolean | undefined) => {
    if (!httpOnly) {
      return;
    }

    assert.ok(cookie.includes('HttpOnly'), 'Cookie is not HttpOnly');
  },
  secure: (cookie: string, secure: boolean | undefined) => {
    if (!secure) {
      return;
    }

    assert.ok(cookie.includes('Secure'), 'Cookie is not secure');
  },
  sameSite: (
    cookie: string,
    sameSite: boolean | 'strict' | 'lax' | 'none' | undefined
  ) => {
    if (!sameSite) {
      return;
    }

    if (sameSite === true) {
      sameSite = 'strict';
    }

    const capitalizedSameSite = toCapitalized(sameSite);

    assert.ok(
      cookie.includes(`SameSite=${capitalizedSameSite}`),
      `Cookie's SameSite is not ${capitalizedSameSite}`
    );
  },
  path: (cookie: string, path: string | undefined) => {
    if (!path) {
      return;
    }

    assert.ok(cookie.includes(`Path=${path}`), `Cookie's Path is not ${path}`);
  }
};

export const assertCookie = (cookie: string, expectedCreatedAt: number) => {
  (Object.keys(cookieOptions) as (keyof CookieOptions)[]).forEach((option) => {
    const assertion = cookieOptionsAssertions[option] as
      | AssertionFunction<typeof option>
      | undefined;

    if (!assertion) {
      return;
    }

    assertion(cookie, cookieOptions[option]);
  });

  const expires = cookie.match(/Expires=([^;]+);/)?.[1];
  assert.ok(expires, 'No expires string in cookie');

  assert.ok(
    Math.abs(new Date(expires).getTime() - expectedCreatedAt - ttl) <
      10 * 60 * 1000,
    'Invalid expires date'
  );
};
