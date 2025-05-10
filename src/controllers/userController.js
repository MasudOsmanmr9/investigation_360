import User from '../models/userModel.js';
import { userRolesConst } from '../config/const.js';
import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import { generateToken } from '../utils/jwtUtils.js';
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
      // Generate a new token with the updated role
        const token = generateToken(user);

      // Send the updated user and new token in the response
        res.json({
            message: 'Role switched successfully.',
            user,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error switching roles', error });
    }
};

export const getCombinedDashboardData = async (req, res) => {
    const { userId, userRole } = req;

    try {
        const dashboardData = {};

        if (userRole === 'requester' || userRole === 'both') {
            const requesterRequests = await Request.find({ requesterId: userId })
                .populate('assignedInvestigatorId', 'name contactDetails')
                .select('-report')
                .sort({ createdAt: -1 }); // Show newest first
            dashboardData.requesterActivities = requesterRequests;
        }

        if (userRole === 'investigator' || userRole === 'both') {
            const investigatorRequests = await Request.find({ assignedInvestigatorId: userId })
                .populate('requesterId', 'name contactDetails')
                .select('-report')
                .sort({ createdAt: -1 }); // Show newest first
            dashboardData.investigatorActivities = investigatorRequests;

            const availableRequests = await Request.find({ status: 'pending', assignedInvestigatorId: { $exists: false } })
                .populate('requesterId', 'name contactDetails')
                .sort({ createdAt: -1 })
                .limit(5); // Show a limited number of available requests
            dashboardData.availableRequests = availableRequests;
        }

        res.json(dashboardData);

    } catch (error) {
        console.error('Error fetching combined dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
};