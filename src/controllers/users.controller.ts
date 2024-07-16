import type { RequestHandler } from 'express';
import { createUser } from '../services/users/users.service.js';

export const createUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = await createUser(req.body);

    res.status(201).send({ user });
  } catch (error) {
    next(error);
  }
};
