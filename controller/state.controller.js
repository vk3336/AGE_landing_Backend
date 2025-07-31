const State = require('../model/state.model');

// Create a new state
exports.createState = async (req, res) => {
    try {
        const { name, code, country, slug } = req.body;
        
        const state = await State.create({
            name,
            code,
            country,
            ...(slug && { slug }) // Include slug if provided
        });

        res.status(201).json({
            status: 'success',
            data: {
                state
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all states
exports.getAllStates = async (req, res) => {
    try {
        const filter = {};
        if (req.query.country) {
            filter.country = req.query.country;
        }
        
        const states = await State.find(filter).sort('name');

        res.status(200).json({
            status: 'success',
            results: states.length,
            data: {
                states
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a single state by ID or slug
exports.getState = async (req, res) => {
    try {
        const { id } = req.params;
        
        const state = await State.findOne({
            $or: [
                { _id: id },
                { slug: id }
            ]
        });

        if (!state) {
            return res.status(404).json({
                status: 'error',
                message: 'No state found with that ID or slug'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                state
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Find state by slug
exports.findBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const state = await State.findOne({ slug });
        
        if (!state) {
            return res.status(404).json({
                status: 'error',
                message: 'No state found with that slug'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                state
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update a state
exports.updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, country, slug } = req.body;
        
        const updateData = { name, code, country };
        if (slug) {
            updateData.slug = slug;
        }

        const state = await State.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!state) {
            return res.status(404).json({
                status: 'error',
                message: 'No state found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                state
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete a state
exports.deleteState = async (req, res) => {
    try {
        const { id } = req.params;

        const state = await State.findByIdAndDelete(id);

        if (!state) {
            return res.status(404).json({
                status: 'error',
                message: 'No state found with that ID'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
