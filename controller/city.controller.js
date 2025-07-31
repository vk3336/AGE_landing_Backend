const City = require('../model/city.model');

// Create a new city
exports.createCity = async (req, res) => {
    try {
        const { name, pincode, country, state, slug } = req.body;
        
        const city = await City.create({
            name,
            pincode,
            country,
            state,
            ...(slug && { slug }) // Include slug if provided
        });

        res.status(201).json({
            status: 'success',
            data: {
                city
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all cities
exports.getAllCities = async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) filter.state = req.query.state;
        if (req.query.country) filter.country = req.query.country;
        
        const cities = await City.find(filter).sort('name');

        res.status(200).json({
            status: 'success',
            results: cities.length,
            data: {
                cities
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a single city by ID or slug
exports.getCity = async (req, res) => {
    try {
        const { id } = req.params;
        
        const city = await City.findOne({
            $or: [
                { _id: id },
                { slug: id }
            ]
        });

        if (!city) {
            return res.status(404).json({
                status: 'error',
                message: 'No city found with that ID or slug'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                city
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Find city by slug
exports.findBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const city = await City.findOne({ slug });
        
        if (!city) {
            return res.status(404).json({
                status: 'error',
                message: 'No city found with that slug'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                city
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update a city
exports.updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pincode, country, state, slug } = req.body;
        
        const updateData = { name, pincode, country, state };
        if (slug) {
            updateData.slug = slug;
        }

        const city = await City.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!city) {
            return res.status(404).json({
                status: 'error',
                message: 'No city found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                city
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete a city
exports.deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        const city = await City.findByIdAndDelete(id);

        if (!city) {
            return res.status(404).json({
                status: 'error',
                message: 'No city found with that ID'
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
