const Location = require("../model/location.model");
const mongoose = require("mongoose");

// SEARCH LOCATIONS BY NAME
exports.searchLocations = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Location.find({
      name: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const {
      name,
      pincode,
      country,
      state,
      city,
      slug,
      language,
      longitude,
      latitude,
      locationquestion1,
      locationquestion2,
      locationquestion3,
      locationquestion4,
      locationquestion5,
      locationquestion6,
      locationanswer1,
      locationanswer2,
      locationanswer3,
      locationanswer4,
      locationanswer5,
      locationanswer6,
    } = req.body;

    const location = await Location.create({
      name,
      pincode,
      country,
      state,
      city,
      slug,
      language,
      longitude,
      latitude,
      locationquestion1,
      locationquestion2,
      locationquestion3,
      locationquestion4,
      locationquestion5,
      locationquestion6,
      locationanswer1,
      locationanswer2,
      locationanswer3,
      locationanswer4,
      locationanswer5,
      locationanswer6,
    });

    res.status(201).json({
      status: "success",
      data: {
        location,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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
        { name: { $regex: req.query.search, $options: "i" } },
        { pincode: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await Location.countDocuments(filter);

    // Get paginated results
    const locations = await Location.find(filter)
      .sort("name")
      .skip(skip)
      .limit(limit)
      .populate("country", "name")
      .populate("state", "name")
      .populate("city", "name");

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: "success",
      results: locations.length,
      data: {
        locations,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get locations with cascading display names for SEO dropdown
exports.getLocationsForSeo = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 1000;

    // Get all locations with populated references
    const locations = await Location.find()
      .limit(limit)
      .populate("country", "name")
      .populate("state", "name")
      .populate("city", "name")
      .lean();

    // Transform locations with cascading display logic
    const transformedLocations = locations.map((location) => {
      let displayName = "";

      // Priority: location name > city > state > country
      if (location.name && location.name.trim()) {
        displayName = location.name;
      } else if (location.city && location.city.name) {
        displayName = location.city.name;
      } else if (location.state && location.state.name) {
        displayName = location.state.name;
      } else if (location.country && location.country.name) {
        displayName = location.country.name;
      } else {
        displayName = "Unknown Location";
      }

      return {
        _id: location._id,
        displayName,
        name: location.name || "",
        city: location.city ? location.city.name : "",
        cityId: location.city ? location.city._id : null,
        state: location.state ? location.state.name : "",
        stateId: location.state ? location.state._id : null,
        country: location.country ? location.country.name : "",
        countryId: location.country ? location.country._id : null,
        pincode: location.pincode || "",
        slug: location.slug || "",
      };
    });

    // Sort by displayName
    transformedLocations.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    res.status(200).json({
      status: "success",
      results: transformedLocations.length,
      data: transformedLocations,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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
        status: "error",
        message: "No location found with that ID or slug",
      });
    }

    res.status(200).json({
      status: "success",
      data: { location },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Find area by slug
exports.findBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const location = await Location.findOne({ slug });

    if (!location) {
      return res.status(404).json({
        status: "error",
        message: "No location found with that slug",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        location,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update a location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      pincode,
      country,
      state,
      city,
      slug,
      language,
      longitude,
      latitude,
      locationquestion1,
      locationquestion2,
      locationquestion3,
      locationquestion4,
      locationquestion5,
      locationquestion6,
      locationanswer1,
      locationanswer2,
      locationanswer3,
      locationanswer4,
      locationanswer5,
      locationanswer6,
    } = req.body;

    // Prepare update object with only the fields that are provided
    const updateData = {};
    if (name) updateData.name = name;
    if (pincode) updateData.pincode = pincode;
    if (country) updateData.country = country;
    if (state) updateData.state = state;
    if (city) updateData.city = city;
    if (slug) updateData.slug = slug;
    if (language) updateData.language = language;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (locationquestion1 !== undefined)
      updateData.locationquestion1 = locationquestion1;
    if (locationquestion2 !== undefined)
      updateData.locationquestion2 = locationquestion2;
    if (locationquestion3 !== undefined)
      updateData.locationquestion3 = locationquestion3;
    if (locationquestion4 !== undefined)
      updateData.locationquestion4 = locationquestion4;
    if (locationquestion5 !== undefined)
      updateData.locationquestion5 = locationquestion5;
    if (locationquestion6 !== undefined)
      updateData.locationquestion6 = locationquestion6;
    if (locationanswer1 !== undefined)
      updateData.locationanswer1 = locationanswer1;
    if (locationanswer2 !== undefined)
      updateData.locationanswer2 = locationanswer2;
    if (locationanswer3 !== undefined)
      updateData.locationanswer3 = locationanswer3;
    if (locationanswer4 !== undefined)
      updateData.locationanswer4 = locationanswer4;
    if (locationanswer5 !== undefined)
      updateData.locationanswer5 = locationanswer5;
    if (locationanswer6 !== undefined)
      updateData.locationanswer6 = locationanswer6;
    const location = await Location.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!location) {
      return res.status(404).json({
        status: "error",
        message: "No location found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        location,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
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
        status: "error",
        message: "No location found with that ID",
      });
    }

    // Check if location is being used in SEO entries
    const Seo = require("../model/Seo");
    const seoUsingLocation = await Seo.findOne({ location: id });

    if (seoUsingLocation) {
      console.log(
        `Location ${id} is being used in SEO entry:`,
        seoUsingLocation._id
      );
      return res.status(400).json({
        status: "error",
        message: `Cannot delete location because it is being used by one or more SEO entries (e.g., ${seoUsingLocation._id})`,
      });
    }

    // Proceed with deletion
    await Location.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Location deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "An error occurred while deleting the location",
    });
  }
};
