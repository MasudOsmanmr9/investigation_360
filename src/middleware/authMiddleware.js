import jwt from 'jsonwebtoken';
// import { JWT_SECRET } from '../../server.js'; // Import JWT secret
import User from '../models/userModel.js';
import { generateToken, verifyToken } from '../utils/jwtUtils.js';

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }

    try {
        
        const decoded = verifyToken(token);
        req.userId = decoded.userId; // Set userId in request for later use
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }
};

// Authorization middleware
export const authorize = (role) => {
    return (req, res, next) => {
        if (req.userRole === role || req.userRole === 'both') { // Allow 'both' roles
            next();
        } else {
            res.status(403).json({ message: `Forbidden. ${req.userRole} does not have permission.` });
        }
    };
};