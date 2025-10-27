const mongoose = require("mongoose");
const Blog = require("../model/Blog");
const { validationResult } = require("express-validator");
const { cloudinaryServices } = require("../services/cloudinary.service.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require("cloudinary").v2;

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

// Helper function to delete an image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
        // Extract public ID from the URL
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `blog-images/${filename.split('.')[0]}`; // Include 'blog-images' folder
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Don't throw the error to prevent the main operation from failing
    }
};

// Update blog
const updateBlog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
        const { title, author, heading, paragraph1, paragraph2, paragraph3, deleteImage1, deleteImage2 } = req.body;
        const updateData = { 
            title, 
            author, 
            heading, 
            paragraph1, 
            paragraph2, 
            paragraph3, 
            updatedAt: Date.now() 
        };

        // Get the current blog to check for existing images
        const currentBlog = await Blog.findById(req.params.id);
        if (!currentBlog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        // Handle image deletions
        const deletionPromises = [];
        if (deleteImage1 === 'true' && currentBlog.blogimage1) {
            // Delete the old image from Cloudinary
            await deleteImageFromCloudinary(currentBlog.blogimage1);
            updateData.blogimage1 = null;
        }
        if (deleteImage2 === 'true' && currentBlog.blogimage2) {
            // Delete the old image from Cloudinary
            await deleteImageFromCloudinary(currentBlog.blogimage2);
            updateData.blogimage2 = null;
        }

        // Handle new image uploads
        const uploadPromises = [];
        if (req.files && req.files['blogimage1']) {
            // If there's an existing image and we're not already deleting it, delete it
            if (currentBlog.blogimage1 && deleteImage1 !== 'true') {
                await deleteImageFromCloudinary(currentBlog.blogimage1);
            }
            // Upload the new image
            const url = await uploadImage(req.files['blogimage1'][0]);
            updateData.blogimage1 = url;
        }
        if (req.files && req.files['blogimage2']) {
            // If there's an existing image and we're not already deleting it, delete it
            if (currentBlog.blogimage2 && deleteImage2 !== 'true') {
                await deleteImageFromCloudinary(currentBlog.blogimage2);
            }
            // Upload the new image
            const url = await uploadImage(req.files['blogimage2'][0]);
            updateData.blogimage2 = url;
        }
        
        // Wait for any remaining upload operations to complete
        await Promise.all(uploadPromises);
        
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
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        // Delete associated images from Cloudinary
        await Promise.all([
            deleteImageFromCloudinary(blog.blogimage1),
            deleteImageFromCloudinary(blog.blogimage2)
        ]);

        // Delete the blog from database
        await Blog.findByIdAndDelete(req.params.id);

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
