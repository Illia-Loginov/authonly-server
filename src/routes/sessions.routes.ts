import { Router } from 'express';
import {
  logInHandler,
  logOutHandler
} from '../controllers/sessions.controller.js';

const router = Router();

router;

router.route('/').post(logInHandler).delete(logOutHandler);

export { router as sessionsRouter };
