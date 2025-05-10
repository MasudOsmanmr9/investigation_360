import Request from '../models/requestModel.js';
import Report from '../models/reportModel.js';
import path from 'path';
import { fileURLToPath } from 'url';


export const downloadReport = async (req, res) => {
    const { requestId } = req.params;

    try {
        // Find the request and populate the report field
        const request = await Request.findById(requestId)
            .populate('requesterId', 'name contactDetails') // Populate requester details
            .populate('assignedInvestigatorId', 'name contactDetails') // Populate investigator details
            .populate('report'); 
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        // Check if the report exists
        if (!request.report || !request.report.file) {
            return res.status(404).json({ message: 'Report not found for this request.' });
        }
        let fileExtension = request.report.file.split('.').pop().toLowerCase();
        // Check if the file extension is valid
        console.log(request.report); // Log the file name for debugging
        console.log('File extensionssssssssssssss:', fileExtension); // Log the file extension for debugging
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
        console.log('file name', request.report.file); // Log the current directory for debugging
        const filePath = path.resolve(__dirname, '../../uploads', request.report.file);
        console.log('File path:', filePath); // Log the file path for debugging
        
        
        const fileName = path.basename(request.report.file);

        console.log('File path:', filePath); // Debugging
        console.log('File name:', fileName); // Debugging
        console.log('MIME type:', mimeType); // Debugging

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
        res.status(500).json({ message: 'Error fetching the report.', error });
    }
};