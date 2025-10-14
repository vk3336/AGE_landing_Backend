const Location = require("../model/location.model");

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
  timezone, 
  language,
  // Add the new fields
  LocalBusinessJsonLd,
  LocalBusinessJsonLdtype,
  LocalBusinessJsonLdcontext,
  LocalBusinessJsonLdname,
  LocalBusinessJsonLdtelephone,
  LocalBusinessJsonLdareaserved,
  LocalBusinessJsonLdaddress,
  LocalBusinessJsonLdaddresstype,
  LocalBusinessJsonLdaddressstreetAddress,
  LocalBusinessJsonLdaddressaddressLocality,
  LocalBusinessJsonLdaddressaddressRegion,
  LocalBusinessJsonLdaddresspostalCode,
  LocalBusinessJsonLdaddressaddressCountry,
  LocalBusinessJsonLdgeo,
  LocalBusinessJsonLdgeotype,
  LocalBusinessJsonLdgeolatitude,
  LocalBusinessJsonLdgeolongitude
} = req.body;

const location = await Location.create({
  name,
  pincode,
  country,
  state,
  city,
  slug,
  timezone,
  language,
  // Add the new fields
  LocalBusinessJsonLd,
  LocalBusinessJsonLdtype,
  LocalBusinessJsonLdcontext,
  LocalBusinessJsonLdname,
  LocalBusinessJsonLdtelephone,
  LocalBusinessJsonLdareaserved,
  LocalBusinessJsonLdaddress,
  LocalBusinessJsonLdaddresstype,
  LocalBusinessJsonLdaddressstreetAddress,
  LocalBusinessJsonLdaddressaddressLocality,
  LocalBusinessJsonLdaddressaddressRegion,
  LocalBusinessJsonLdaddresspostalCode,
  LocalBusinessJsonLdaddressaddressCountry,
  LocalBusinessJsonLdgeo,
  LocalBusinessJsonLdgeotype,
  LocalBusinessJsonLdgeolatitude,
  LocalBusinessJsonLdgeolongitude
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
      timezone, 
      language,
      // Add the new fields
      LocalBusinessJsonLd,
      LocalBusinessJsonLdtype,
      LocalBusinessJsonLdcontext,
      LocalBusinessJsonLdname,
      LocalBusinessJsonLdtelephone,
      LocalBusinessJsonLdareaserved,
      LocalBusinessJsonLdaddress,
      LocalBusinessJsonLdaddresstype,
      LocalBusinessJsonLdaddressstreetAddress,
      LocalBusinessJsonLdaddressaddressLocality,
      LocalBusinessJsonLdaddressaddressRegion,
      LocalBusinessJsonLdaddresspostalCode,
      LocalBusinessJsonLdaddressaddressCountry,
      LocalBusinessJsonLdgeo,
      LocalBusinessJsonLdgeotype,
      LocalBusinessJsonLdgeolatitude,
      LocalBusinessJsonLdgeolongitude
    } = req.body;

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
// Add the new fields
if (LocalBusinessJsonLd !== undefined) updateData.LocalBusinessJsonLd = LocalBusinessJsonLd;
if (LocalBusinessJsonLdtype !== undefined) updateData.LocalBusinessJsonLdtype = LocalBusinessJsonLdtype;
if (LocalBusinessJsonLdcontext !== undefined) updateData.LocalBusinessJsonLdcontext = LocalBusinessJsonLdcontext;
if (LocalBusinessJsonLdname !== undefined) updateData.LocalBusinessJsonLdname = LocalBusinessJsonLdname;
if (LocalBusinessJsonLdtelephone !== undefined) updateData.LocalBusinessJsonLdtelephone = LocalBusinessJsonLdtelephone;
if (LocalBusinessJsonLdareaserved !== undefined) updateData.LocalBusinessJsonLdareaserved = LocalBusinessJsonLdareaserved;
if (LocalBusinessJsonLdaddress !== undefined) updateData.LocalBusinessJsonLdaddress = LocalBusinessJsonLdaddress;
if (LocalBusinessJsonLdaddresstype !== undefined) updateData.LocalBusinessJsonLdaddresstype = LocalBusinessJsonLdaddresstype;
if (LocalBusinessJsonLdaddressstreetAddress !== undefined) updateData.LocalBusinessJsonLdaddressstreetAddress = LocalBusinessJsonLdaddressstreetAddress;
if (LocalBusinessJsonLdaddressaddressLocality !== undefined) updateData.LocalBusinessJsonLdaddressaddressLocality = LocalBusinessJsonLdaddressaddressLocality;
if (LocalBusinessJsonLdaddressaddressRegion !== undefined) updateData.LocalBusinessJsonLdaddressaddressRegion = LocalBusinessJsonLdaddressaddressRegion;
if (LocalBusinessJsonLdaddresspostalCode !== undefined) updateData.LocalBusinessJsonLdaddresspostalCode = LocalBusinessJsonLdaddresspostalCode;
if (LocalBusinessJsonLdaddressaddressCountry !== undefined) updateData.LocalBusinessJsonLdaddressaddressCountry = LocalBusinessJsonLdaddressaddressCountry;
if (LocalBusinessJsonLdgeo !== undefined) updateData.LocalBusinessJsonLdgeo = LocalBusinessJsonLdgeo;
if (LocalBusinessJsonLdgeotype !== undefined) updateData.LocalBusinessJsonLdgeotype = LocalBusinessJsonLdgeotype;
if (LocalBusinessJsonLdgeolatitude !== undefined) updateData.LocalBusinessJsonLdgeolatitude = LocalBusinessJsonLdgeolatitude;
if (LocalBusinessJsonLdgeolongitude !== undefined) updateData.LocalBusinessJsonLdgeolongitude = LocalBusinessJsonLdgeolongitude;
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
