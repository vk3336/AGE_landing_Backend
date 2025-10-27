const express = require('express');
const router = express.Router();
const blogController = require('../controller/blogController');

// Create a new blog
router.post('/', blogController.createBlog);

// Get all blogs
router.get('/', blogController.getAllBlogs);

// Get single blog by ID
router.get('/:id', blogController.getBlogById);

// Update blog
router.put('/:id', blogController.updateBlog);

// Delete blog
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
