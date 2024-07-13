import 'dotenv/config';
import app from './app.js';
import { port, serverUrl } from './config/server.config.js';

app.listen(port, () => {
  console.log(`Auth Only Server listening on ${serverUrl}:${port}`);
});
