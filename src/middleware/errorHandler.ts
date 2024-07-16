import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { StatusError } from '../utils/StatusError.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json(error.format());
  }

  if (error instanceof StatusError) {
    return res.status(error.status).send(error.message);
  }

  console.error(error);

  return res.status(500).end();
};
