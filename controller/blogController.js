const mongoose = require("mongoose");
const Blog = require("../model/Blog");
const { validationResult } = require("express-validator");
const { cloudinaryServices } = require("../services/cloudinary.service.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'blog-images') => {
    if (!file) return null;
    try {
        const result = await cloudinaryServices.cloudinaryImageUpload(
            file.buffer,
            file.originalname,
            folder,
            false,
            'image'
        );
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};

// Create a new blog
const createBlog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
        const { title, author, heading, paragraph1, paragraph2, paragraph3 } = req.body;
        
        // Upload images if they exist in the request
        const [blogimage1, blogimage2] = await Promise.all([
            req.files && req.files['blogimage1'] ? uploadImage(req.files['blogimage1'][0]) : null,
            req.files && req.files['blogimage2'] ? uploadImage(req.files['blogimage2'][0]) : null
        ]);
        
        const blog = new Blog({
            title,
            author,
            heading,
            paragraph1,
            paragraph2,
            paragraph3,
            blogimage1,
            blogimage2
        });

        await blog.save();
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error creating blog' 
        });
    }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update blog
const updateBlog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
        const { title, author, heading, paragraph1, paragraph2, paragraph3 } = req.body;
        const updateData = { 
            title, 
            author, 
            heading, 
            paragraph1, 
            paragraph2, 
            paragraph3, 
            updatedAt: Date.now() 
        };

        // Handle image uploads if new images are provided (in parallel)
        const imageUpdates = [];
        if (req.files && req.files['blogimage1']) {
            imageUpdates.push(
                uploadImage(req.files['blogimage1'][0]).then(url => {
                    updateData.blogimage1 = url;
                })
            );
        }
        if (req.files && req.files['blogimage2']) {
            imageUpdates.push(
                uploadImage(req.files['blogimage2'][0]).then(url => {
                    updateData.blogimage2 = url;
                })
            );
        }
        
        // Wait for all image uploads to complete
        await Promise.all(imageUpdates);
        
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error updating blog' 
        });
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};
