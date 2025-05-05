import express from 'express';
import { submitRequest, viewMyRequests } from '../controllers/requestController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, submitRequest);
router.get('/me', authenticate, viewMyRequests);

export default router;