import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { BadRequestError,NotAuthorizedError,NotFoundError,RequestValidationError,SystemError } from '../errors/index.js';

export const submitRequest = async (req, res, next) => {
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
        // res.status(500).json({ message: 'Error submitting request.', error });
        next(`Error submitting request: ${error}`);
    }
};

export const viewMyRequests = async (req, res, next) => {
    const { userId } = req;
    const { page = 1, limit = 10,status = 'pending',sort = null } = req.query; 

    try {
        let query = {
            requesterId: userId,
            status: status,
        };
        let sortOrder = sort && sort == 'ASC'? 1 : -1; // Default to ascending order
        const userRequests = await Request.find(query)
            .populate('assignedInvestigatorId', 'name contactDetails')
            .select('-report')
            .skip((page - 1) * limit)
            .sort({ createdAt: sortOrder })
            .limit(parseInt(limit));
        
        if (!userRequests || userRequests.length === 0) {
            // return res.status(404).json({ message: 'No requests found.' });
            throw new NotFoundError('No requests found.');
        }
        
        const totalRequests = await Request.countDocuments(query);
        if (!totalRequests) {
            // return res.status(404).json({ message: 'No requests found.' });
            throw new NotFoundError('Request count failed');
        }
        const totalPages = Math.ceil(totalRequests / limit);

        res.json({
            totalRequests,
            totalPages,
            currentPage: parseInt(page),
            requests: userRequests,
        });
        //res.json(userRequests);
    } catch (error) {
        // res.status(500).json({ message: 'Error viewing requests.', error });
        next(error);
    }
};

export const getSingleRequest = async (req, res, next) => {
    const { requestId } = req.params; // Extract requestId from the route parameters

    try {
        // Find the request by ID and populate related fields
        const request = await Request.findById(requestId)
            .populate('requesterId', 'name contactDetails') // Populate requester details
            .populate('assignedInvestigatorId', 'name contactDetails') // Populate investigator details
            .populate('report'); // Populate report details

        if (!request) {
            throw new NotFoundError('Request not found.');
        }

        res.json({ message: 'Request fetched successfully.', request });
    } catch (error) {
        next(error);
    }
};

export const downloadReport = async (req, res, next) => {
    const { requestId } = req.params;

    try {
        // Find the request and populate the report field
        const request = await Request.findById(requestId).populate('report');
        if (!request) {
            throw new NotFoundError('Request not found.');
        }

        // Check if the report exists
        if (!request.report || !request.report.file) {
            throw new NotFoundError('Report not found for this request.');
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
        // res.status(500).json({ message: 'Error fetching the report.', error });
        next(error);
    }
};