import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

export const browseAvailableRequests = async (req, res) => {
    try {
        const availableRequests = await Request.find({ status: 'pending', assignedInvestigatorId: { $exists: false } })
            .populate('requesterId', 'name contactDetails');
        res.json(availableRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error browsing available requests.', error });
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

export const upload = multer({ storage });

export const submitReport = async (req, res) => {
    const { userId } = req;
    const { requestId, reportData } = req.body;

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status !== 'in-progress') {
            return res.status(400).json({ message: 'Request is not in progress.' });
        }

        const newReport = new Report({
            investigatorId: userId,
            requestId,
            reportData,
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
    try {
        const investigatorRequests = await Request.find({ assignedInvestigatorId: userId })
            .populate('requesterId', 'name contactDetails')
            .select('-report');
        res.json(investigatorRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investigator requests', error });
    }
};