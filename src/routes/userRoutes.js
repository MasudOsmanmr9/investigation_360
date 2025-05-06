import express from 'express';
import { updateProfile, switchRole, getProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/update-profile', authenticate, updateProfile);
router.patch('/switch-role', authenticate, switchRole);

export default router;