import express from 'express';
import { updateProfile, switchRole, getProfile, getUserProfile, getCombinedDashboardData } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { runMongoQueryController } from '../controllers/aiController.js';

const router = express.Router();
router.get('/dashboard', authenticate, getCombinedDashboardData);
router.get('/profile', authenticate, getProfile);
router.get('/investigator/:id', authenticate, getUserProfile);
router.put('/update-profile', authenticate, updateProfile);
router.patch('/switch-role', authenticate, switchRole);
router.post('/ai-query', authenticate, runMongoQueryController);

export default router;