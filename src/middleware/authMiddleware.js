import jwt from 'jsonwebtoken';
// import { JWT_SECRET } from '../../server.js'; // Import JWT secret
import User from '../models/userModel.js';
import { generateToken, verifyToken } from '../utils/jwtUtils.js';
import { NotAuthorizedError } from '../errors/index.js';

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        // return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        return next(new NotAuthorizedError('Unauthorized. No token provided.'));
    }

    try {
        
        const decoded = verifyToken(token);
        req.userId = decoded.userId; // Set userId in request for later use
        req.userRole = decoded.role;
        req.activeRole = decoded.activeRole;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        // return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
        next(new NotAuthorizedError('Unauthorized. Invalid token.'));
    }
};

// Authorization middleware
export const authorize = (role) => {
    return (req, res, next) => {
        if(Array.isArray(role)){
            if(role.includes(req.userRole)){
                next();
            }else{
                res.status(403).json({ message: `Forbidden. ${req.userRole} does not have permission.` });
            } // Check if userRole is in the allowed roles
        }else{
            if ( req.userRole === 'both' || req.activeRole === role) { // Allow 'both' roles
                next();
            } else {
                // res.status(403).json({ message: `Forbidden. ${req.userRole} does not have permission.` });
                next(new NotAuthorizedError(`Forbidden. ${req.userRole} type user does not have permission.`));
            }
        }
    
    };
};