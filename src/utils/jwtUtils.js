// src/utils/jwtUtils.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role, activeRole: user.activeRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export { generateToken, verifyToken };