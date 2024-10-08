import { Router } from 'express';
import {
  createResourceHandler,
  deleteResourceHandler,
  editResourceHandler,
  getResourcesHandler
} from '../controllers/resources.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

router
  .route('/')
  .post(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    createResourceHandler
  )
  .get(getResourcesHandler);

router
  .route('/:id')
  .delete(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    deleteResourceHandler
  )
  .patch(
    isAuthenticated({ required: true, userProperties: ['id'] }),
    editResourceHandler
  );

export { router as resourcesRouter };
