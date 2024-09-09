import pg from 'pg';
import { BadRequestError } from './StatusError.js';

const ERROR_CODES = {
  UNIQUE_VIOLATION: '23505'
} as const;

export const handleDbError = (error: pg.DatabaseError) => {
  switch (error.code) {
    case ERROR_CODES.UNIQUE_VIOLATION:
      const keyValueRegex = /^Key \((.+)\)=\((.+)\)/;
      const endingPeriodRegex = /.$/;

      const message =
        error.detail
          ?.replace(keyValueRegex, `$1 "$2"`)
          .replace(endingPeriodRegex, '') || 'Must be unique';

      return new BadRequestError(message);
    default:
      return error;
  }
};
