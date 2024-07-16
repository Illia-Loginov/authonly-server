import type { CookieOptions } from 'express';

export const ttl = 3 * 60 * 60 * 1000; // 3 hours
export const cookieName = '__Host-session';
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/'
};
