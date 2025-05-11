import express from 'express';
import {
    createReview,
    getInvestigatorReviews,
    getRequesterReviews,
} from '../controllers/reviewController.js';
import { authenticate,authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new review
router.post('/', authenticate, createReview);

// Get all reviews for a specific investigator
router.get('/investigator/:investigatorId', authenticate,authorize(['investigator','requester','both']), getInvestigatorReviews);

// Get all reviews by a specific requester
router.get('/requester/:requesterId', authenticate, getRequesterReviews);

export default router;