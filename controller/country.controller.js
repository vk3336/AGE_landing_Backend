const Country = require('../model/country.model');

// Create a new country
exports.createCountry = async (req, res) => {
    try {
        const { name, code, slug } = req.body;
        
        const country = await Country.create({
            name,
            code,
            ...(slug && { slug }) // Include slug if provided
        });

        res.status(201).json({
            status: 'success',
            data: {
                country
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all countries
exports.getAllCountries = async (req, res) => {
    try {
        const countries = await Country.find().sort('name');

        res.status(200).json({
            status: 'success',
            results: countries.length,
            data: {
                countries
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a single country by ID or slug
exports.getCountry = async (req, res) => {
    try {
        const { id } = req.params;
        
        const country = await Country.findOne({
            $or: [
                { _id: id },
                { slug: id }
            ]
        });

        if (!country) {
            return res.status(404).json({
                status: 'error',
                message: 'No country found with that ID or slug'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                country
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Find country by slug
exports.findBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const country = await Country.findOne({ slug });

        if (!country) {
            return res.status(404).json({
                status: 'error',
                message: 'No country found with that slug'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                country
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update a country
exports.updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, slug } = req.body;
        
        const updateData = { name, code };
        if (slug) {
            updateData.slug = slug;
        }

        const country = await Country.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!country) {
            return res.status(404).json({
                status: 'error',
                message: 'No country found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                country
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete a country
exports.deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;

        const country = await Country.findByIdAndDelete(id);

        if (!country) {
            return res.status(404).json({
                status: 'error',
                message: 'No country found with that ID'
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
