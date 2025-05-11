import Review from '../models/reviewModel.js';
import User from '../models/userModel.js';

// Create a new review
export const createReview = async (req, res) => {
    const { requesterId, investigatorId, rating, comment } = req.body;

    try {
        // Check if the investigator exists
        const investigator = await User.findById(investigatorId);
        if (!investigator || !['investigator', 'both'].includes(investigator.role)) {
            return res.status(404).json({ message: 'Investigator not found.' });
        }

        // Create a new review
        const review = new Review({
            requesterId: req.userId, // Assuming the requester is the logged-in user
            investigatorId,
            rating,
            comment,
        });

        await review.save();
        res.status(201).json({ message: 'Review created successfully.', review });
    } catch (error) {
        res.status(500).json({ message: 'Error creating review.', error });
    }
};



export const getInvestigatorReviews = async (req, res) => {
    const { investigatorId } = req.params;
    const { page = 1, limit = 5 } = req.query; // Default to page 1, 5 reviews per page

    try {
        const totalReviews = await Review.countDocuments({ investigatorId });
        const reviews = await Review.find({ investigatorId })
            .populate('requesterId', 'name email contactDetails') // Populate requester details
            .sort({ createdAt: -1 }) 
            .skip((page - 1) * limit) 
            .limit(parseInt(limit)); 

        res.json({
            message: 'Reviews fetched successfully.',
            reviews,
            totalPages: Math.ceil(totalReviews / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews.', error });
    }
};

// Get all reviews by a requester
export const getRequesterReviews = async (req, res) => {
    const { requesterId } = req.params;

    try {
        const reviews = await Review.find({ requesterId })
            .populate('investigatorId', 'name') // Populate investigator details
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({ message: 'Reviews fetched successfully.', reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews.', error });
    }
};