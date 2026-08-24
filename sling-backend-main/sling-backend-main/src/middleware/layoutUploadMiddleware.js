const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer for multiple files
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10 // Maximum 10 files at a time
    }
});

// Middleware for multiple file upload
const uploadMultiple = upload.array('images', 10);

// Wrapper middleware to handle errors
const layoutUploadMiddleware = (req, res, next) => {
    uploadMultiple(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer error
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File size too large. Maximum size is 5MB per file.'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    message: 'Too many files. Maximum 10 files allowed.'
                });
            }
            return res.status(400).json({
                message: 'File upload error: ' + err.message
            });
        } else if (err) {
            // Other errors
            return res.status(400).json({
                message: err.message
            });
        }
        
        // Check if at least one file was uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'Please upload at least one image file.'
            });
        }
        
        next();
    });
};

module.exports = layoutUploadMiddleware; 