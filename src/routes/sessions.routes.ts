import { Router } from 'express';
import {
  logInHandler,
  logOutHandler
} from '../controllers/sessions.controller.js';

const router = Router();

router.post('/', logInHandler);
router.delete('/', logOutHandler);

export default router;
