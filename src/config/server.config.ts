import type { CorsOptions } from 'cors';
import { validateServerConfig } from './envValidation.js';

const {
  PORT: port,
  NODE_ENV: env,
  SERVER_URL: serverUrl,
  CLIENT_URL: clientUrl
} = validateServerConfig();

export { port, env, serverUrl };

export const corsOptions: CorsOptions = {
  origin: [clientUrl]
};
