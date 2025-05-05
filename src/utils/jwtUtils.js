// src/utils/jwtUtils.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export { generateToken, verifyToken };