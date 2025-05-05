import User from '../models/userModel.js';

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
    const { newRole } = req.body; 
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (newRole !== 'requester' && newRole !== 'investigator') {
            return res.status(400).json({ message: 'Invalid role. Must be "requester" or "investigator"' });
        }
        user.activeRole = newRole;
        await user.save();
        res.json({ message: 'Role switched successfully', activeRole: user.activeRole });

    } catch (error) {
        res.status(500).json({ message: 'Error switching roles', error });
    }
};