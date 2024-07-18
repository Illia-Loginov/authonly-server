import { Router } from 'express';
import {
  createUserHandler,
  deleteUserHandler
} from '../controllers/users.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', createUserHandler);
router.delete(
  '/:id',
  isAuthenticated({ required: true, userProperties: ['id'] }),
  deleteUserHandler
);

export default router;
