const State = require("../model/state.model");

// SEARCH STATES BY NAME
exports.searchStates = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await State.find({
      name: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// Create a new state
exports.createState = async (req, res) => {
  try {
    const { name, code, country, slug } = req.body;

    const state = await State.create({
      name,
      code,
      country,
      ...(slug && { slug }), // Include slug if provided
    });

    res.status(201).json({
      status: "success",
      data: {
        state,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all states with pagination
exports.getAllStates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Build the query
    const query = {};
    
    // Add country filter if provided
    if (req.query.country) {
      query.country = req.query.country;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
      
      // If we have a country name search, we need to look it up
      if (search.length > 2) { // Only do this for longer search terms
        const Country = require('../model/country.model');
        const countries = await Country.find({
          name: { $regex: search, $options: 'i' }
        }, '_id');
        
        if (countries.length > 0) {
          if (!query.$or) query.$or = [];
          query.$or.push({ country: { $in: countries.map(c => c._id) } });
        }
      }
    }

    // Get total count for pagination
    const total = await State.countDocuments(query);
    
    // Get paginated results
    const states = await State.find(query)
      .sort("name")
      .skip(skip)
      .limit(limit)
      .populate('country', 'name code');

    res.status(200).json({
      status: "success",
      data: {
        states,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
          results: states.length
        }
      },
    });
  } catch (error) {
    console.error('Error in getAllStates:', error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a single state by ID or slug
exports.getState = async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findOne({
      $or: [{ _id: id }, { slug: id }],
    });

    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "No state found with that ID or slug",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        state,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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
        status: "error",
        message: "No state found with that slug",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        state,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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

    const state = await State.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "No state found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        state,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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
        status: "error",
        message: "No state found with that ID",
      });
    }

    // Check if state is being used in cities or locations
    const City = require("../model/city.model");
    const Location = require("../model/location.model");

    const [cityCount, locationCount] = await Promise.all([
      City.countDocuments({ state: id }),
      Location.countDocuments({ state: id }),
    ]);

    if (cityCount > 0 || locationCount > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot delete state because it is being used by other records",
      });
    }

    // If no references, proceed with deletion
    await State.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "State deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting state:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the state",
    });
  }
};
