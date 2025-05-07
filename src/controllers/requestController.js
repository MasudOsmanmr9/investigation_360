import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const { page = 1, limit = 10 } = req.query; 
    try {
        const userRequests = await Request.find({ requesterId: userId })
            .populate('assignedInvestigatorId', 'name contactDetails')
            .select('-report')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const totalRequests = await Request.countDocuments({ requesterId: userId });
        const totalPages = Math.ceil(totalRequests / limit);

        res.json({
            totalRequests,
            totalPages,
            currentPage: parseInt(page),
            requests: userRequests,
        });
        //res.json(userRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error viewing requests.', error });
    }
};

export const downloadReport = async (req, res) => {
    const { requestId } = req.params;

    try {
        // Find the request and populate the report field
        const request = await Request.findById(requestId).populate('report');
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // Check if the report exists
        if (!request.report || !request.report.file) {
            return res.status(404).json({ message: 'Report not found for this request.' });
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Ensure the file path is resolved correctly
        const relativeFilePath = request.report.file.startsWith('/uploads/')
            ? request.report.file.replace('/uploads/', '') // Remove '/uploads/' prefix
            : request.report.file;

        const filePath = path.resolve(__dirname, '../../uploads', relativeFilePath);
        // Send the file to the requester
        res.download(filePath, request.report.file, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ message: 'Error downloading the report.' });
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the report.', error });
    }
};