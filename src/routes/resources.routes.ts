import { Router } from 'express';
import { createResourceHandler } from '../controllers/resources.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router
  .route('/')
  .post(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    createResourceHandler
  );

export { router as resourcesRouter };
