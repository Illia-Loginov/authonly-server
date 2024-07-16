import { z } from 'zod';

const sessionCookieSchema = z.string().length(64);

export const validateSessionCookie = (payload: any) =>
  sessionCookieSchema.parse(payload);
