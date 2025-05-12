import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { body,check  } from 'express-validator';
const router = express.Router();

router.post(
    '/signup',
    [
        body('email').isEmail().withMessage('Please provide a valid email.'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long.'),
        check('role').notEmpty().withMessage('role is required.').isIn(['requester', 'investigator', 'both']).withMessage('role must be either "requester", "investigator" or "both"'),
    ],
    validateRequest,     
    register
);

router.post(
    '/signin',
    [
        body('email').isEmail().withMessage('Please provide a valid email.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    validateRequest,
    login
);

export default router;