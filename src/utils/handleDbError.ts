import pg from 'pg';
import { BadRequestError } from './StatusError.js';

const ERROR_CODES = {
  UNIQUE_VIOLATION: '23505'
} as const;

export const handleDbError = (error: pg.DatabaseError) => {
  switch (error.code) {
    case ERROR_CODES.UNIQUE_VIOLATION:
      const detailRegex = /^Key \((.+)\)=\((.+)\)/;
      return new BadRequestError(error.detail?.replace(detailRegex, `$1 "$2"`));
    default:
      return error;
  }
};
