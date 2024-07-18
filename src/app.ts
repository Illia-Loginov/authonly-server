import express, { json } from 'express';
import healthcheckRouter from './routes/healthcheck.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import { cookieSecret } from './config/sessions.config.js';
import { usersRouter } from './routes/users.routes.js';
import { sessionsRouter } from './routes/sessions.routes.js';

const app = express();

app.use(json());
app.use(cookieParser(cookieSecret));

app.use('/healthcheck', healthcheckRouter);
app.use('/users', usersRouter);
app.use('/sessions', sessionsRouter);

app.use(errorHandler);

export default app;
