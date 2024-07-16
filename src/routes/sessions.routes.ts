import { Router } from 'express';
import { logInHandler } from '../controllers/sessions.controller.js';

const router = Router();

router.post('/', logInHandler);

export default router;
