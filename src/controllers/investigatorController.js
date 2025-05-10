import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

export const browseAvailableRequests = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 results per page

    try {
        const availableRequests = await Request.find({ status: 'pending', assignedInvestigatorId: { $exists: false } })
            .populate('requesterId', 'name contactDetails')
            .skip((page - 1) * limit) // Skip documents for previous pages
            .limit(parseInt(limit)); // Limit the number of results

        const totalRequests = await Request.countDocuments({ status: 'pending', assignedInvestigatorId: { $exists: false } });

        res.json({
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: parseInt(page),
            requests: availableRequests,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error browsing available requests.', error });
    }
};

export const viewInvestigatorRequests = async (req, res) => {
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
        res.status(500).json({ message: 'Error fetching investigator requests.', error });
    }
};

export const acceptRequest = async (req, res) => {
    const { userId } = req;
    const { requestId } = req.params;

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending.' });
        }

        request.status = 'in-progress';
        request.assignedInvestigatorId = userId;
        await request.save();

        res.json({ message: 'Request accepted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting request.', error });
    }
};

export const declineRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending.' });
        }
        request.status = 'cancelled';
        await request.save();
        res.json({ message: 'Request declined.' });
    } catch (error) {
        res.status(500).json({ message: 'Error declining request', error });
    }
};

export const submitReport = async (req, res) => {
    const { userId, fileExtension } = req;
    const { reportData } = req.body;
    const { requestId } = req.params; // Assuming the file is sent in the request body

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status !== 'in-progress') {
            return res.status(400).json({ message: 'Request is not in progress.' });
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
        res.status(500).json({ message: 'Error submitting report.', error });
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