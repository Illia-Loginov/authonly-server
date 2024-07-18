import { Router } from 'express';
import {
  createResourceHandler,
  deleteResourceHandler
} from '../controllers/resources.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router
  .route('/')
  .post(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    createResourceHandler
  );

router
  .route('/:id')
  .delete(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    deleteResourceHandler
  );

export { router as resourcesRouter };
