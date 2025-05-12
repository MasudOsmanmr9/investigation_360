import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
// import { JWT_SECRET } from '../server.js';
import { generateToken } from '../utils/jwtUtils.js';
import { verifyToken } from '../utils/jwtUtils.js';
import { userRolesConst } from '../config/const.js';
import { BadRequestError,NotAuthorizedError,RequestValidationError,SystemError } from '../errors/index.js';

export const register = async (req, res, next) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError('User already exists.');
        }
        if (userRolesConst.indexOf(role) === -1) {
            // return res.status(400).json({ message: `Invalid role. Must be ${userRolesConst.join(' or ')}` });
            throw new BadRequestError(`Invalid role. Must be ${userRolesConst.join(' or ')}`);
        }
        let activeRole = role === 'both'? 'requester' : role; // Default to requester role if both
        
        const newUser = new User({ email, password, role, activeRole });
        await newUser.save();
        delete newUser.password
        const token = generateToken(newUser);
        res.status(201).json({ message: 'User registered successfully.', token, user:newUser});
    } catch (error) {
        // res.status(500).json({ message: 'Error registering user.', error });
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;
     try {
        const user = await User.findOne({ email });
        if (!user) {
             throw new NotAuthorizedError('Invalid credentials.');
        }
        const isPasswordValid = await user.comparePassword(password); // Compare password using the method defined in userModel
        if (!isPasswordValid) {
            throw new NotAuthorizedError('Invalid credentials.');
        }
        delete user.password; // Remove password from the user object before sending it in the response
        const token = generateToken(user);
        res.json({ message: 'Login successful.', token, user });
    } catch (error) {
        console.log({error})
        next(error);
    }
};