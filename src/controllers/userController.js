import User from '../models/userModel.js';
import { userRolesConst } from '../config/const.js';

export const getProfile = async (req, res) => {
    const { userId } = req; 
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'Profile fetched successfully.', user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile.', error });
    }
};

export const updateProfile = async (req, res) => {
    const { userId } = req; 
    const { name, contactDetails } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.name = name || user.name;
        user.contactDetails = contactDetails || user.contactDetails;
        await user.save();
        res.json({ message: 'Profile updated successfully.', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile.', error });
    }
};

export const switchRole = async (req, res) => {
    const { userId } = req;
    const { switchRoleto } = req.body; 
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(user.role !== 'both'){
            return res.status(401).json({ message: 'You are not authorized to switch roles' });
        }

        if (userRolesConst.indexOf(switchRoleto) === -1) {
            return res.status(400).json({ message: 'Invalid role. Must be "requester" or "investigator"' });
        }
        user.activeRole = switchRoleto;
        await user.save();
        res.json({ message: 'Role switched successfully', activeRole: user.activeRole });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error switching roles', error });
    }
};