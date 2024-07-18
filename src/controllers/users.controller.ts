import type { RequestHandler, Request } from 'express';
import { createUser, deleteUser } from '../services/users/users.service.js';
import { createSessionCookie } from './sessions.controller.js';
import { cookieName, cookieOptions } from '../config/sessions.config.js';
import { deleteSession } from '../services/sessions/sessions.service.js';

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

export const deleteUserHandler: RequestHandler = async (
  req: Request & { user?: any },
  res,
  next
) => {
  try {
    const deletedUser = await deleteUser(req.params, req.user);

    res
      .status(200)
      .clearCookie(cookieName, cookieOptions)
      .json({ user: deletedUser });
  } catch (error) {
    next(error);
  }
};
