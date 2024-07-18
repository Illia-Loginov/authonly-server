import { Router } from 'express';
import {
  createUserHandler,
  deleteUserHandler
} from '../controllers/users.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/').post(createUserHandler);

router
  .route('/:id')
  .delete(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    deleteUserHandler
  );

export { router as usersRouter };
