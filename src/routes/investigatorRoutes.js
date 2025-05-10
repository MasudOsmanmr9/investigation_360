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
import upload from '../middleware/uploadMiddleware.js'; // Import multer configuration

const router = express.Router();

router.get('/requests', authenticate, authorize('investigator'), browseAvailableRequests); // Only investigators can access
router.get('/my-requests', authenticate, viewInvestigatorRequests);
router.post('/requests/:requestId/accept', authenticate, authorize('investigator'), acceptRequest);
router.post('/requests/:requestId/decline', authenticate, authorize('investigator'), declineRequest);
router.post('/reports/:requestId', authenticate, authorize('investigator'), upload.single('reportFile'), submitReport); // File upload route
router.get('/requests/my', authenticate, authorize('investigator'), getInvestigatorRequests);

export default router;