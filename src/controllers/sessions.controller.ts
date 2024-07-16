import type { RequestHandler } from 'express';
import { logIn } from '../services/sessions/sessions.service.js';
import type { SessionsTable } from '../types/SessionsTable.js';
import { cookieName, cookieOptions } from '../config/sessions.config.js';

export const createSessionCookie = (
  session: Pick<SessionsTable, 'id' | 'expires_at'>
) => {
  return [
    cookieName,
    session.id,
    {
      ...cookieOptions,
      maxAge: session.expires_at.getTime() - Date.now()
    }
  ] as const;
};

export const logInHandler: RequestHandler = async (req, res, next) => {
  try {
    const { session, user } = await logIn(req.body);

    res
      .status(201)
      .cookie(...createSessionCookie(session))
      .json({ user });
  } catch (error) {
    next(error);
  }
};

export const logOutHandler: RequestHandler = async (req, res, next) => {
  try {
    res.status(204).clearCookie(cookieName, cookieOptions).end();
  } catch (error) {
    next(error);
  }
};
