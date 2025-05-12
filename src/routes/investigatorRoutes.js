import express from 'express';
import {
    browseAvailableRequests,
    acceptRequest,
    declineRequest,
    submitReport,
    getInvestigatorRequests,
    viewInvestigatorRequests
} from '../controllers/investigatorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js'; // Import middleware
import upload from '../middleware/uploadMiddleware.js';
import { body, param } from 'express-validator'; // Import multer configuration
import { validateRequest } from '../middleware/validationMiddleware.js';
const router = express.Router();

router.get('/requests', authenticate, authorize('investigator'), browseAvailableRequests); // Only investigators can access
router.get('/my-requests', authenticate, viewInvestigatorRequests);
// router.post('/requests/:requestId/accept', authenticate, authorize('investigator'), acceptRequest);
router.post('/requests/:requestId/accept',     
    [
        authenticate,
        authorize('investigator'),
        param('requestId').isMongoId().withMessage('Invalid request ID.'),
        validateRequest,
    ],
    acceptRequest);
router.post(
    '/requests/:requestId/decline', 
    [
        authenticate,
        authorize('investigator'),
        param('requestId').isMongoId().withMessage('Invalid request ID.'),
        validateRequest,
    ],
    declineRequest
);
router.post(
    '/reports/:requestId', 
    [
        authenticate,
        authorize('investigator'),
        upload.single('reportFile'), // File upload middleware
        param('requestId').isMongoId().withMessage('Invalid request ID.'),
        body('reportData').notEmpty().withMessage('Report data is required.'),
        validateRequest,
    ],
    submitReport
); // File upload route
router.get('/requests/my', authenticate, authorize('investigator'), getInvestigatorRequests);

export default router;