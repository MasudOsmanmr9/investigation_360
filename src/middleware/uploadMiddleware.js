import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {

        console.log('req.params',JSON.stringify(req.params))
        const requestId = req.params.requestId; // Access requestId from form-data
        if (!requestId) {
            return cb(new Error('Request ID is missing in params'), null);
        }

        console.log('req.params.requestId',req.params.requestId)
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const uniqueSuffix = requestId;
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage });

export default upload; // Changed to default export