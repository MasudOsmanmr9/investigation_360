import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';

export const submitRequest = async (req, res) => {
    const { userId } = req;
    const { area, description } = req.body;
    try {
        const newRequest = new Request({
            requesterId: userId,
            area,
            description,
        });
        await newRequest.save();
        res.status(201).json({ message: 'Investigation request submitted successfully.', requestId: newRequest._id });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting request.', error });
    }
};

export const viewMyRequests = async (req, res) => {
    const { userId } = req;
    try {
        const userRequests = await Request.find({ requesterId: userId })
            .populate('assignedInvestigatorId', 'name contactDetails')
            .select('-report');
        res.json(userRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error viewing requests.', error });
    }
};