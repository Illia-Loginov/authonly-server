import express, { json } from 'express';
import usersRouter from './routes/users.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(json());

app.get('/', (req, res) => {
  res.status(200).send('Ok');
});

app.use('/users', usersRouter);

app.use(errorHandler);

export default app;
