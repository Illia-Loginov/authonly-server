import type { RequestHandler, Request } from 'express';
import type { AnyColumn } from 'kysely';
import type { Database } from '../types/Database.js';
import { getUserBySessionId } from '../services/sessions/sessions.service.js';
import { cookieName } from '../config/sessions.config.js';
import { UnauthenticatedError } from '../utils/StatusError.js';
import { ZodError } from 'zod';
import type { User } from '../types/UsersTable.js';

interface isAuthenticatedProps {
  required?: boolean;
  userProperties?: AnyColumn<Database, 'users'>[];
}

export const isAuthenticated = ({
  required = true,
  userProperties = ['id']
}: isAuthenticatedProps): RequestHandler => {
  return async (
    req: Request & { user?: Pick<User, (typeof userProperties)[number]> },
    res,
    next
  ) => {
    try {
      const user = await getUserBySessionId(
        req.signedCookies[cookieName],
        userProperties
      );

      req.user = user;

      next();
    } catch (error) {
      if (!required) {
        return next();
      }

      if (error instanceof ZodError) {
        return next(
          new UnauthenticatedError('No valid session token cookie provided')
        );
      }

      next(error);
    }
  };
};
