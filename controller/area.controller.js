const Area = require('../model/area.model');

// Create a new area
exports.createArea = async (req, res) => {
    try {
        const { name, pincode, country, state, city, slug } = req.body;
        
        const area = await Area.create({
            name,
            pincode,
            country,
            state,
            city,
            ...(slug && { slug }) // Include slug if provided
        });

        res.status(201).json({
            status: 'success',
            data: {
                area
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all areas
exports.getAllAreas = async (req, res) => {
    try {
        const filter = {};
        if (req.query.city) filter.city = req.query.city;
        if (req.query.state) filter.state = req.query.state;
        if (req.query.country) filter.country = req.query.country;
        
        const areas = await Area.find(filter).sort('name');

        res.status(200).json({
            status: 'success',
            results: areas.length,
            data: {
                areas
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a single area by ID or slug
exports.getArea = async (req, res) => {
    try {
        const { id } = req.params;
        
        const area = await Area.findOne({
            $or: [
                { _id: id },
                { slug: id }
            ]
        });

        if (!area) {
            return res.status(404).json({
                status: 'error',
                message: 'No area found with that ID or slug'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                area
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Find area by slug
exports.findBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const area = await Area.findOne({ slug });
        
        if (!area) {
            return res.status(404).json({
                status: 'error',
                message: 'No area found with that slug'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                area
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update an area
exports.updateArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pincode, country, state, city, slug } = req.body;
        
        const updateData = { name, pincode, country, state, city };
        if (slug) {
            updateData.slug = slug;
        }

        const area = await Area.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!area) {
            return res.status(404).json({
                status: 'error',
                message: 'No area found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                area
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete an area
exports.deleteArea = async (req, res) => {
    try {
        const { id } = req.params;

        const area = await Area.findByIdAndDelete(id);

        if (!area) {
            return res.status(404).json({
                status: 'error',
                message: 'No area found with that ID'
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
