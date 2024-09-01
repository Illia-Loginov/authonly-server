import { Router } from 'express';
import {
  createUserHandler,
  deleteUserHandler,
  whoamiHandler
} from '../controllers/users.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router
  .route('/')
  .post(createUserHandler)
  .get(
    isAuthenticated({ required: true, userProperties: ['id', 'username'] }),
    whoamiHandler
  );

router
  .route('/:id')
  .delete(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    deleteUserHandler
  );

export { router as usersRouter };
