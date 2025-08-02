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

        // First check if state exists
        const state = await State.findById(id);
        if (!state) {
            return res.status(404).json({
                status: 'error',
                message: 'No state found with that ID'
            });
        }

        // Check if state is being used in cities or locations
        const City = require('../model/city.model');
        const Location = require('../model/location.model');

        const [cityCount, locationCount] = await Promise.all([
            City.countDocuments({ state: id }),
            Location.countDocuments({ state: id })
        ]);

        if (cityCount > 0 || locationCount > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete state because it is being used by other records'
            });
        }

        // If no references, proceed with deletion
        await State.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: 'State deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('Error deleting state:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting the state'
        });
    }
};
