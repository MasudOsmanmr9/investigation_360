import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
// import { JWT_SECRET } from '../server.js';
import { generateToken } from '../utils/jwtUtils.js';
import { verifyToken } from '../utils/jwtUtils.js';
import { userRolesConst } from '../config/const.js';

export const register = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        if (userRolesConst.indexOf(role) === -1) {
            return res.status(400).json({ message: `Invalid role. Must be ${userRolesConst.join(' or ')}` });
        }
        let activeRole = role === 'both'? 'requester' : role; // Default to requester role if both
        
        const newUser = new User({ email, password, role, activeRole });
        await newUser.save();
        const token = generateToken(newUser);
        res.status(201).json({ message: 'User registered successfully.', token, userId: newUser._id, role: newUser.role });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user.', error });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = generateToken(user);
        res.json({ message: 'Login successful.', token, userId: user._id, role: user.role, activeRole: user.activeRole });
    } catch (error) {
        console.log({error})
        res.status(500).json({ message: 'Error logging in.', error });
    }
};