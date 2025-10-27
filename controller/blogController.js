const Blog = require('../model/Blog');
const { validationResult } = require('express-validator');

// Create a new blog
const createBlog = async (req, res) => {
    try {
        const { title, author, heading, paragraph1, paragraph2, paragraph3 } = req.body;
        
        const blog = new Blog({
            title,
            author,
            heading,
            paragraph1,
            paragraph2,
            paragraph3
        });

        await blog.save();
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
    try {
        const { title, author, heading, paragraph1, paragraph2, paragraph3 } = req.body;
        
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, author, heading, paragraph1, paragraph2, paragraph3, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
