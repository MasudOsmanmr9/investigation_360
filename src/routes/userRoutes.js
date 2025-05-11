import express from 'express';
import { updateProfile, switchRole, getProfile, getUserProfile, getCombinedDashboardData } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/dashboard', authenticate, getCombinedDashboardData);
router.get('/profile', authenticate, getProfile);
router.get('/investigator/:id', authenticate, getUserProfile);
router.put('/update-profile', authenticate, updateProfile);
router.patch('/switch-role', authenticate, switchRole);

export default router;