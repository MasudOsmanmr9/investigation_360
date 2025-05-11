import User from '../models/userModel.js';
import { userRolesConst } from '../config/const.js';
import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import Review from '../models/reviewModel.js';
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

export const getUserProfile = async (req, res) => {
    const { id } = req.params; 
    try {
        const user = await User.findById(id);
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
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    try {
        const dashboardData = {};
        if(userRole === 'investigator' || userRole === 'both') {
            console.log('acccesssing investigator');
            const [availableCount, inProgressCount, completedCount, reviewsCount] = await Promise.all([
                Request.countDocuments({ status: 'pending', assignedInvestigatorId: { $exists: false } }),
                Request.countDocuments({ status: 'in-progress', assignedInvestigatorId: userId }),
                Request.countDocuments({ status: 'completed', assignedInvestigatorId: userId }),
                Review.countDocuments({investigatorId: userId})
            ]);
            dashboardData.investigatorCountActivities = {};
           // dashboardData.investigatorActivities.counts ={}
            dashboardData.investigatorCountActivities.counts = {
                available: availableCount,
                inProgress: inProgressCount,
                completed: completedCount,
                reviews: reviewsCount,
            };
        }

        if(userRole === 'requester' || userRole === 'both') {
            console.log('acccesssing requester');
            const [pendingCount, inProgressCount, completedCount] = await Promise.all([
                Request.countDocuments({ status: 'pending', requesterId: userId }),
                Request.countDocuments({ status: 'in-progress', assignedInvestigatorId: { $exists: true } }),
                Request.countDocuments({ status: 'completed', assignedInvestigatorId: { $exists: true } }),
            ]);
            
            dashboardData.requesterCountActivities = {};
           // dashboardData.requesterActivities.counts = {};
            dashboardData.requesterCountActivities.counts = {
                pending: pendingCount,
                inProgress: inProgressCount,
                completed: completedCount,
            };
        }
        // Count all available, in-progress, and completed requests
        

        if (userRole === 'requester' || userRole === 'both') {
            const requesterRequests = await Request.find({ requesterId: userId })
                .populate('assignedInvestigatorId', 'name contactDetails')
                .select('-report')
                .sort({ createdAt: -1 }).limit(5); // Show newest first
            dashboardData.requesterActivities = requesterRequests;
        }

        if (userRole === 'investigator' || userRole === 'both') {
            const investigatorRequests = await Request.find({ assignedInvestigatorId: userId })
                .populate('requesterId', 'name contactDetails')
                .select('-report')
                .sort({ createdAt: -1 }).limit(5); ; // Show newest first
            dashboardData.investigatorActivities = investigatorRequests;

            const availableRequests = await Request.find({ status: 'pending', assignedInvestigatorId: { $exists: false } })
                .populate('requesterId', 'name contactDetails')
                .sort({ createdAt: -1 })
                .limit(5); // Show a limited number of available requests
            dashboardData.availableRequests = availableRequests;
            const reviews = await Review.find({investigatorId: userId})
                .populate('requesterId', 'name contactDetails') // Populate requester details
                .sort({ createdAt: -1 }) // Sort by newest first
                .limit(5); // Show a limited number of reviews
            dashboardData.reviews = reviews
        }

        res.json({message: 'dashboard data fetched successfully.',dashboardData});

    } catch (error) {
        console.error('Error fetching combined dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
};