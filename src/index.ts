import app from './app.js';
import { port } from './config/server.config.js';
import { gracefulShutdown } from './utils/gracefulShutdown.js';

const server = app.listen(port, () => {
  console.log(`Auth Only Server listening on port ${port}`);
});

process.on('SIGTERM', gracefulShutdown(server));
process.on('SIGINT', gracefulShutdown(server));
