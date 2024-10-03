import 'dotenv/config';
import { z, ZodError, ZodSchema } from 'zod';
import { formatZodError } from '../utils/formatZodError.js';

const validateEnv = <TSchema extends ZodSchema>(
  schema: TSchema,
  configName: string
) => {
  return (): z.infer<TSchema> => {
    try {
      return schema.parse(process.env);
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(
          `Validation error in ${configName} config:`,
          formatZodError(error)
        );
        process.exit(1);
      } else {
        throw error;
      }
    }
  };
};

const serverConfigSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  NODE_ENV: z.enum(['development', 'production']),
  CLIENT_URL: z.string().url()
});

export const validateServerConfig = validateEnv(serverConfigSchema, 'server');

const dbConfigSchema = z.object({
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_NAME: z.string()
});

export const validateDbConfig = validateEnv(dbConfigSchema, 'db');

const sessionConfigSchema = z.object({
  COOKIE_SECRET: z.string()
});

export const validateSessionConfig = validateEnv(
  sessionConfigSchema,
  'session'
);
