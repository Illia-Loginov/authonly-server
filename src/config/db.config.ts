import { validateDbConfig } from './envValidation.js';

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = validateDbConfig();

export const pgPoolConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME
};
