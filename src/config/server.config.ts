import { validateServerConfig } from './envValidation.js';

const {
  PORT: port,
  NODE_ENV: env,
  SERVER_URL: serverUrl
} = validateServerConfig();

export { port, env, serverUrl };
