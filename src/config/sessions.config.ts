import type { CookieOptions } from 'express';
import { validateSessionConfig } from './envValidation.js';

export const ttl = 3 * 60 * 60 * 1000; // 3 hours
export const cookieName = '__Host-session';
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  signed: true
};

const { COOKIE_SECRET: cookieSecret } = validateSessionConfig();

export { cookieSecret };
