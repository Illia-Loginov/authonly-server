// TODO: add validation
const {
  PORT: port = 3000,
  NODE_ENV: env = 'development',
  SERVER_URL: serverUrl
} = process.env;

export { port, env, serverUrl };
