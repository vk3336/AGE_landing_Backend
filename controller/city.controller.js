const City = require("../model/city.model");

// SEARCH CITIES BY NAME
exports.searchCities = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await City.find({
      name: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const { name, country, state, slug } = req.body;

    const city = await City.create({
      name,
      country,
      state,
      ...(slug && { slug }), // Include slug if provided
    });

    res.status(201).json({
      status: "success",
      data: {
        city,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all cities with pagination
exports.getAllCities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.state) filter.state = req.query.state;
    if (req.query.country) filter.country = req.query.country;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [cities, total] = await Promise.all([
      City.find(filter)
        .sort("name")
        .skip(skip)
        .limit(limit)
        .populate('state', 'name')
        .populate('country', 'name'),
      City.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: "success",
      data: {
        cities,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a single city by ID or slug
exports.getCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findOne({
      $or: [{ _id: id }, { slug: id }],
    });

    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "No city found with that ID or slug",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        city,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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
        status: "error",
        message: "No city found with that slug",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        city,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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

    const city = await City.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "No city found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        city,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a city
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if city exists
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "No city found with that ID",
      });
    }

    // Check if city is being used in locations
    const Location = require("../model/location.model");
    const locationCount = await Location.countDocuments({ city: id });

    if (locationCount > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot delete city because it is being used by one or more locations",
      });
    }

    // If no references, proceed with deletion
    await City.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "City deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the city",
    });
  }
};
