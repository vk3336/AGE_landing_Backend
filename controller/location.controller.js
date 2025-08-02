const Location = require('../model/location.model');

// Create a new location
exports.createLocation = async (req, res) => {
    try {
        const { name, pincode, country, state, city, slug, timezone, language } = req.body;
        
        const location = await Location.create({
            name,
            pincode,
            country,
            state,
            city,
            ...(slug && { slug }), // Include slug if provided
            ...(timezone && { timezone }), // Include timezone if provided
            ...(language && { language }) // Include language if provided
        });

        res.status(201).json({
            status: 'success',
            data: {
                location
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all locations with pagination
exports.getAllLocations = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filtering
        const filter = {};
        if (req.query.city) filter.city = req.query.city;
        if (req.query.state) filter.state = req.query.state;
        if (req.query.country) filter.country = req.query.country;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { pincode: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Get total count for pagination
        const total = await Location.countDocuments(filter);
        
        // Get paginated results
        const locations = await Location.find(filter)
            .sort('name')
            .skip(skip)
            .limit(limit)
            .populate('country', 'name')
            .populate('state', 'name')
            .populate('city', 'name');

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: 'success',
            results: locations.length,
            data: {
                locations,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    limit
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a single location by ID or slug
exports.getLocation = async (req, res) => {
    try {
        const { id } = req.params;
        let location;
        
        // Check if the ID is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            location = await Location.findById(id);
        } else {
            // If not a valid ObjectId, try to find by slug
            location = await Location.findOne({ slug: id });
        }

        if (!location) {
            return res.status(404).json({
                status: 'error',
                message: 'No location found with that ID or slug'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { location }
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
                location
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update a location
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pincode, country, state, city, slug, timezone, language } = req.body;
        
        // Prepare update object with only the fields that are provided
        const updateData = {};
        if (name) updateData.name = name;
        if (pincode) updateData.pincode = pincode;
        if (country) updateData.country = country;
        if (state) updateData.state = state;
        if (city) updateData.city = city;
        if (slug) updateData.slug = slug;
        if (timezone) updateData.timezone = timezone;
        if (language) updateData.language = language;
        
        const location = await Location.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!location) {
            return res.status(404).json({
                status: 'error',
                message: 'No location found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                location
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        // First check if location exists
        const location = await Location.findById(id);
        if (!location) {
            return res.status(404).json({
                status: 'error',
                message: 'No location found with that ID'
            });
        }

        try {
            // Try to check if location is being used in SEO if the model exists
            const Seo = require('../model/seo.model');
            const seoCount = await Seo.countDocuments({ location: id });

            if (seoCount > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot delete location because it is being used by one or more SEO entries'
                });
            }
        } catch (seoError) {
            // If SEO model doesn't exist or there's an error, log it but continue with deletion
            console.log('SEO model not found, skipping reference check:', seoError.message);
        }

        // Proceed with deletion
        await Location.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: 'Location deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'An error occurred while deleting the location'
        });
    }
};

