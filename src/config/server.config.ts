import type { CorsOptions } from 'cors';
import { validateServerConfig } from './envValidation.js';

const {
  PORT: port,
  NODE_ENV: env,
  CLIENT_URL: clientUrl
} = validateServerConfig();

export { port, env };

export const corsOptions: CorsOptions = {
  origin: [clientUrl],
  credentials: true
};
