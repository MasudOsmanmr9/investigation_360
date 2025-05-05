import express from 'express';
import { updateProfile, switchRole } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', authenticate, updateProfile);
router.post('/switch-role', authenticate, switchRole);

export default router;