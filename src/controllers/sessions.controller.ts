import type { RequestHandler } from 'express';
import { logIn } from '../services/sessions/sessions.service.js';
import type { SessionsTable } from '../types/SessionsTable.js';

export const createSessionCookie = (
  session: Pick<SessionsTable, 'id' | 'expires_at'>
) => {
  return [
    '__Host-session',
    session.id,
    {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: session.expires_at.getTime() - Date.now(),
      path: '/'
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
