import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { BadRequestError,NotAuthorizedError,NotFoundError,RequestValidationError,SystemError } from '../errors/index.js';

export const downloadReport = async (req, res, next) => {
    const { requestId } = req.params;

    try {
        // Find the request and populate the report field
        const request = await Request.findById(requestId)
            .populate('requesterId', 'name contactDetails') // Populate requester details
            .populate('assignedInvestigatorId', 'name contactDetails') // Populate investigator details
            .populate('report'); 
        if (!request) {
            throw new NotFoundError('Request not found.');
        }
        // Check if the report exists
        if (!request.report || !request.report.file) {
            throw new NotFoundError('Report not found for this request.');
        }
        let fileExtension = request.report.file.split('.').pop().toLowerCase();
        // Check if the file extension is valid
    
        const mimeType = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            pdf: 'application/pdf',
        }[fileExtension] || 'application/octet-stream';
        console.log('Mime type:', mimeType); // Log the MIME type for debugging

        res.setHeader('Content-Type', mimeType);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const filePath = path.resolve(__dirname, '../../uploads', request.report.file);
        
        
        const fileName = path.basename(request.report.file);

        // console.log('File path:', filePath); // Debugging
        // console.log('File name:', fileName); // Debugging
        // console.log('MIME type:', mimeType); // Debugging

        // Explicitly set the Content-Disposition header
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        
        res.download(filePath, request.report.file, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ message: 'Error downloading the report.' });
            }
        });
        
    } catch (error) {
        console.error('Error downloading report:', error);
        next(error);
    }
};