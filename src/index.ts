import app from './app.js';
import { port, serverUrl } from './config/server.config.js';
import { gracefulShutdown } from './utils/gracefulShutdown.js';

const server = app.listen(port, () => {
  console.log(`Auth Only Server listening on ${serverUrl}:${port}`);
});

process.on('SIGTERM', gracefulShutdown(server));
process.on('SIGINT', gracefulShutdown(server));
