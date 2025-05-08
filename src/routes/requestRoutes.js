import express from 'express';
import { submitRequest, viewMyRequests, downloadReport, getSingleRequest } from '../controllers/requestController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, submitRequest);
router.get('/me', authenticate, viewMyRequests);
router.get('/details/:requestId', authenticate, getSingleRequest);
// router.get('/report-file/:requestId/', authenticate, downloadReport);

export default router;