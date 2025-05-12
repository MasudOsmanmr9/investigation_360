import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { BadRequestError,NotAuthorizedError,NotFoundError,RequestValidationError,SystemError } from '../errors/index.js';
export const browseAvailableRequests = async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 results per page

    try {
        const availableRequests = await Request.find({ status: 'pending', assignedInvestigatorId: { $exists: false } })
            .populate('requesterId', 'name contactDetails')
            .skip((page - 1) * limit) // Skip documents for previous pages
            .limit(parseInt(limit)); // Limit the number of results
        
        if(!availableRequests) {
            throw new NotFoundError('No available requests found.');
        }

        const totalRequests = await Request.countDocuments({ status: 'pending', assignedInvestigatorId: { $exists: false } });

        if(!totalRequests) {
            throw new NotFoundError('request count failed');
        }
        res.json({
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: parseInt(page),
            requests: availableRequests,
        });
    } catch (error) {
        next(error);
    }
};

export const viewInvestigatorRequests = async (req, res,next) => {
    const { userId } = req; // Extract the investigator's user ID from the request
    const { page = 1, limit = 10, status } = req.query; // Default to page 1, 10 results per page, and optional status filter

    try {
        // Build the query dynamically based on the status filter
        const query = { assignedInvestigatorId: userId };
        if (status) {
            query.status = status; // Add status filter if provided
        }

        // Fetch paginated results
        const investigatorRequests = await Request.find(query)
            .populate('requesterId', 'name contactDetails') // Populate requester details
            .select('-report') // Exclude the report field
            .skip((page - 1) * limit) // Skip documents for previous pages
            .limit(parseInt(limit)); // Limit the number of results

        if(!investigatorRequests) {
            throw new NotFoundError('No investigator requests found.');
        }
        // Get the total count of matching documents
        const totalRequests = await Request.countDocuments(query);
        if(!totalRequests) {
            throw new NotFoundError('request count failed');
        }
        // Respond with paginated data and metadata
        res.json({
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: parseInt(page),
            requests: investigatorRequests,
        });
    } catch (error) {
        // res.status(500).json({ message: 'Error fetching investigator requests.', error });
        next(error);
    }
};

export const acceptRequest = async (req, res, next) => {
    const { userId } = req;
    const { requestId } = req.params;

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            // return res.status(404).json({ message: 'Request not found.' });
            throw new NotFoundError('Request not found.');
        }
        if (request.status !== 'pending') {
            // return res.status(400).json({ message: 'Request is not pending.' });
            throw new BadRequestError('Request is not pending.');
        }

        request.status = 'in-progress';
        request.assignedInvestigatorId = userId;
        await request.save();

        res.json({ message: 'Request accepted successfully.' });
    } catch (error) {
        next(error);
    }
};

export const declineRequest = async (req, res, next) => {
    const { requestId } = req.params;
    try {
        const request = await Request.findById(requestId);
        if (!request) {
            throw new NotFoundError('Request not found.');
        }
        if (request.status !== 'pending') {
            throw new BadRequestError('Request is not pending.');
        }
        request.status = 'cancelled';
        await request.save();
        res.json({ message: 'Request declined.' });
    } catch (error) {
        next(error);
    }
};

export const submitReport = async (req, res) => {
    const { userId, fileExtension } = req;
    const { reportData } = req.body;
    const { requestId } = req.params; // Assuming the file is sent in the request body

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            throw new NotFoundError('Request not found.');
        }
        if (request.status !== 'in-progress') {
            throw new BadRequestError('Request is completed.');
        }
        console.log('File extension:', fileExtension); // Log the file extension for debugging
        const newReport = new Report({
            investigatorId: userId,
            requestId,
            reportData,
            file: `reportFile-${requestId}.${fileExtension}`, // Assuming the file is sent in the request body
        });

        await newReport.save();

        request.report = newReport._id;
        request.status = 'completed';
        await request.save();

        res.status(201).json({ message: 'Report submitted successfully.', reportId: newReport._id });
    } catch (error) {
        next(error);
    }
};

export const getInvestigatorRequests = async (req, res) => {
    const { userId } = req;
    const { status, page = 1, limit = 10 } = req.query; // Default to page 1 and 10 results per page

    try {
        // Build the query dynamically based on the status filter
        const query = { assignedInvestigatorId: userId };
        if (status) {
            query.status = status; // Add status filter if provided
        }

        // Fetch paginated results
        const investigatorRequests = await Request.find(query)
            .populate('requesterId', 'name contactDetails')
            .select('-report')
            .skip((page - 1) * limit) // Skip documents for previous pages
            .limit(parseInt(limit)); // Limit the number of results

        // Get the total count of matching documents
        const totalRequests = await Request.countDocuments(query);

        // Respond with paginated data and metadata
        res.json({
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: parseInt(page),
            requests: investigatorRequests,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investigator requests', error });
    }
};