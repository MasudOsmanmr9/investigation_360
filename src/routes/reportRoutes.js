import express from 'express';
import { downloadReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/download/:requestId/', authenticate, downloadReport);

export default router;