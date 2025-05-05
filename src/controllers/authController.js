import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../server.js';

export const register = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        const newUser = new User({ email, password, role });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
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
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful.', token, userId: user._id, role: user.role, activeRole: user.activeRole });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in.', error });
    }
};