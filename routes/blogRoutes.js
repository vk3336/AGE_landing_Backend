const express = require('express');
const router = express.Router();
const blogController = require('../controller/blogController');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 2 // Maximum of 2 files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/avif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, JPG, WEBP, and AVIF are allowed.'), false);
        }
    }
});

// Middleware to handle multiple file uploads with specific field names
const handleBlogImages = (req, res, next) => {
    const uploadFields = upload.fields([
        { name: 'blogimage1', maxCount: 1 },
        { name: 'blogimage2', maxCount: 1 }
    ]);

    uploadFields(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                success: false, 
                error: err.message 
            });
        } else if (err) {
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        next();
    });
};

// Create a new blog with images
router.post('/', handleBlogImages, blogController.createBlog);

// Get all blogs
router.get('/', blogController.getAllBlogs);

// Get single blog by ID
router.get('/:id', blogController.getBlogById);

// Update blog with optional images
router.put('/:id', handleBlogImages, blogController.updateBlog);

// Delete blog
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
