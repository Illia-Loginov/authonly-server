import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { StatusError } from '../utils/StatusError.js';
import pg from 'pg';
import { handleDbError } from '../utils/handleDbError.js';
import { formatZodError } from '../utils/formatZodError.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof pg.DatabaseError) {
    error = handleDbError(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid input',
      issues: formatZodError(error)
    });
  }

  if (error instanceof StatusError) {
    return res.status(error.status).json({
      message: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    message: 'Internal server error'
  });
};
