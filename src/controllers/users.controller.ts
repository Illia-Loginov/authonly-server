import type { RequestHandler } from 'express';
import { createUser } from '../services/users/users.service.js';
import { createSessionCookie } from './sessions.controller.js';

export const createUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const [{ session, user }] = await Promise.all([
      createUser(req.body),
      deleteSession(req.signedCookies[cookieName])
    ]);

    res
      .status(201)
      .cookie(...createSessionCookie(session))
      .send({ user });
  } catch (error) {
    next(error);
  }
};
