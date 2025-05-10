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
        console.log('acccess 1',{requestId},{request});
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        console.log('acccess 2',{request});
        // Check if the report exists
        if (!request.report || !request.report.file) {
            return res.status(404).json({ message: 'Report not found for this request.' });
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const filePath = path.resolve(__dirname, '../../uploads', request.report.file);
        
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