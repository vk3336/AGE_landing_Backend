const StaticSEO = require('../model/topicpage');
const { validationResult } = require('express-validator');

// Create a new StaticSEO entry
exports.createStaticSEO = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation failed', errors.array());
        }

        const staticSEO = new StaticSEO(req.body);
        await staticSEO.save();
        
        res.status(201).json({
            success: true,
            data: staticSEO
        });
    } catch (error) {
        next(error);
    }
};

// Get all StaticSEO entries
exports.getAllStaticSEO = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        
        if (status) {
            filter.status = status;
        }
        
        const staticSEOs = await StaticSEO.find(filter).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: staticSEOs.length,
            data: staticSEOs
        });
    } catch (error) {
        next(error);
    }
};

// Get single StaticSEO entry by ID
exports.getStaticSEOById = async (req, res, next) => {
    try {
        const staticSEO = await StaticSEO.findById(req.params.id);
        
        if (!staticSEO) {
            throw new ApiError(404, 'StaticSEO not found');
        }
        
        res.status(200).json({
            success: true,
            data: staticSEO
        });
    } catch (error) {
        next(error);
    }
};

// Update StaticSEO entry
exports.updateStaticSEO = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation failed', errors.array());
        }
        
        const staticSEO = await StaticSEO.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!staticSEO) {
            throw new ApiError(404, 'StaticSEO not found');
        }
        
        res.status(200).json({
            success: true,
            data: staticSEO
        });
    } catch (error) {
        next(error);
    }
};

// Delete StaticSEO entry
exports.deleteStaticSEO = async (req, res, next) => {
    try {
        const staticSEO = await StaticSEO.findByIdAndDelete(req.params.id);
        
        if (!staticSEO) {
            throw new ApiError(404, 'StaticSEO not found');
        }
        
        res.status(200).json({
            success: true,
            message: 'StaticSEO deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get StaticSEO by slug
exports.getStaticSEOBySlug = async (req, res, next) => {
    try {
        const staticSEO = await StaticSEO.findOne({ slug: req.params.slug });
        
        if (!staticSEO) {
            throw new ApiError(404, 'StaticSEO not found');
        }
        
        res.status(200).json({
            success: true,
            data: staticSEO
        });
    } catch (error) {
        next(error);
    }
};