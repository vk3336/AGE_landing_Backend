const Seo = require("../model/Seo");
const Product = require("../model/Product");
const Location = require("../model/location.model");
const mongoose = require("mongoose");

// SEARCH SEOS BY TITLE
const searchSeos = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Seo.find({
      title: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// Create SEO
const createSeo = async (req, res) => {
  try {
    let { product, ...seoData } = req.body;

    // Convert string numbers to numbers for Twitter player dimensions
    if (typeof seoData.twitterPlayerWidth === "string")
      seoData.twitterPlayerWidth = Number(seoData.twitterPlayerWidth);
    if (typeof seoData.twitterPlayerHeight === "string")
      seoData.twitterPlayerHeight = Number(seoData.twitterPlayerHeight);

    // Convert string numbers to numbers for Open Graph video dimensions
    if (typeof seoData.ogVideoWidth === "string")
      seoData.ogVideoWidth = Number(seoData.ogVideoWidth);
    if (typeof seoData.ogVideoHeight === "string")
      seoData.ogVideoHeight = Number(seoData.ogVideoHeight);

    // All fields are optional, including product and location

    // Check if product exists
    if (product) {
      // Check if product exists in database
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(400).json({
          success: false,
          message: "Product not found in the database",
        });
      }
      // Allow multiple SEO entries for the same product
    }

    // Check if location exists if provided
    if (seoData.location) {
      const locationExists = await Location.findById(seoData.location);
      if (!locationExists) {
        return res.status(400).json({
          success: false,
          message: "Location not found in the database",
        });
      }
      // Allow multiple SEO entries with the same location
      // No duplicate check for locations
    }

    const seo = new Seo({
      product,
      ...seoData,
    });

    const savedSeo = await seo.save();
    const populatedSeo = await Seo.findById(savedSeo._id).populate("product");

    res.status(201).json({
      success: true,
      message: "SEO created successfully",
      data: populatedSeo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating SEO",
      error: error.message,
    });
  }
};

// Get all SEO - ULTRA FAST
const getAllSeo = async (req, res) => {
  try {
    // 🚀 PERFORMANCE OPTIMIZATIONS - NO LIMITS, ALL DATA

    // 🚀 GET ALL SEO DATA - NO PAGINATION LIMITS
    const seoList = await Seo.find();
    // .populate("product", "name img category") // Select only needed fields
    // .lean() // Convert to plain objects for speed
    // .exec();

    res.status(200).json({
      success: true,
      message: "SEO data retrieved successfully",
      data: seoList,
      total: seoList.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting SEO data",
      error: error.message,
    });
  }
};

// Get SEO by ID
const getSeoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SEO ID",
      });
    }

    const seo = await Seo.findById(id)
      .populate("product")
      .populate("location", "name slug");

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SEO retrieved successfully",
      data: seo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting SEO data",
      error: error.message,
    });
  }
};

// Get SEO by Product ID
const getSeoByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const seo = await Seo.findOne({ product: productId })
      .populate("product")
      .populate("location", "name slug");

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found for this product",
      });
    }

    res.status(200).json({
      success: true,
      message: "SEO retrieved successfully",
      data: seo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting SEO data",
      error: error.message,
    });
  }
};

// Update SEO
const updateSeo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SEO ID",
      });
    }

    let { product, location, ...updateData } = req.body;

    // Convert string numbers to numbers for Twitter player dimensions
    if (typeof updateData.twitterPlayerWidth === "string") {
      updateData.twitterPlayerWidth = Number(updateData.twitterPlayerWidth);
    }
    if (typeof updateData.twitterPlayerHeight === "string") {
      updateData.twitterPlayerHeight = Number(updateData.twitterPlayerHeight);
    }

    // Convert string numbers to numbers for Open Graph video dimensions
    if (typeof updateData.ogVideoWidth === "string") {
      updateData.ogVideoWidth = Number(updateData.ogVideoWidth);
    }
    if (typeof updateData.ogVideoHeight === "string") {
      updateData.ogVideoHeight = Number(updateData.ogVideoHeight);
    }

    // Handle product update if provided
    if (product !== undefined) {
      if (product) {
        // If product is being set to a non-null value, validate it exists
        const productExists = await Product.findById(product);
        if (!productExists) {
          return res.status(400).json({
            success: false,
            message: "Product not found",
          });
        }

        // Allow multiple SEO entries for the same product
        // No duplicate check needed
      }
      // If product is set to null, we'll allow it (it will be removed)
    }

    // Handle location update if provided
    if (location !== undefined) {
      if (location) {
        // If location is being set to a non-null value, validate it exists
        const locationExists = await Location.findById(location);
        if (!locationExists) {
          return res.status(400).json({
            success: false,
            message: "Location not found",
          });
        }
        // Removed duplicate location check to allow multiple products with same location
      }
      // If location is set to null, we'll allow it (it will be removed)
    }

    const updatedSeo = await Seo.findByIdAndUpdate(
      id,
      { product, location, ...updateData },
      { new: true, runValidators: true }
    )
      .populate("product")
      .populate("location", "name slug");

    if (!updatedSeo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SEO updated successfully",
      data: updatedSeo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating SEO",
      error: error.message,
    });
  }
};

// Delete SEO
const deleteSeo = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deletion if referenced by any Product
    const productUsing = await Product.findOne({ seo: id });
    if (productUsing) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: SEO is in use by one or more products.",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SEO ID",
      });
    }
    const deletedSeo = await Seo.findByIdAndDelete(id);
    if (!deletedSeo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "SEO deleted successfully",
      data: deletedSeo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting SEO",
      error: error.message,
    });
  }
};

// Get SEO by slug
const getSeoBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const seo = await Seo.findOne({ slug }).populate("product");

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found for this slug",
      });
    }

    res.status(200).json({
      success: true,
      message: "SEO retrieved successfully",
      data: seo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting SEO data",
      error: error.message,
    });
  }
};

// Get SEO by location ID
const getSeoByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID format",
      });
    }

    const seo = await Seo.find({ location: locationId })
      .populate("product")
      .populate("location", "name slug");

    if (!seo || seo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No SEO data found for this location",
      });
    }

    res.status(200).json({
      success: true,
      data: seo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all SEO data without purchase price
const getAllSeoPublic = async (req, res) => {
  try {
    const seoList = await Seo.find()
      .select("-purchasePrice") // Exclude purchase price
      .select(
        "product location popularproduct topratedproduct landingPageProduct shopyProduct slug title createdAt updatedAt"
      )
      .populate({
        path: "product",
        populate: [
          { path: "category", select: "name slug" },
          { path: "substructure", select: "name slug" },
          { path: "content", select: "name description" },
          { path: "design", select: "name slug" },
          { path: "subfinish", select: "name slug" },
          { path: "subsuitable", select: "name slug" },
          { path: "vendor", select: "name slug" },
          { path: "groupcode", select: "name slug" },
          { path: "color", select: "name slug" },
          { path: "motif", select: "name slug" },
        ],
      })
      .populate({
        path: "location",
        populate: [
          { path: "country", select: "name code" },
          { path: "state", select: "name code" },
        ],
        // select: "name slug",
      })
      .lean();

    res.status(200).json({
      success: true,
      message: "Public SEO list retrieved successfully",
      data: seoList,
      total: seoList.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting public SEO list",
      error: error.message,
    });
  }
};

// Get SEO by slug without purchase price
const getSeoBySlugPublic = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const seo = await Seo.findOne({ slug })
      .select("-purchasePrice") // Exclude purchase price
      .select(
        "product location popularproduct topratedproduct landingPageProduct shopyProduct slug title createdAt updatedAt"
      )
      .populate({
        path: "product",
        populate: [
          { path: "category", select: "name slug" },
          { path: "substructure", select: "name slug" },
          { path: "content", select: "name description" },
          { path: "design", select: "name slug" },
          { path: "subfinish", select: "name slug" },
          { path: "subsuitable", select: "name slug" },
          { path: "vendor", select: "name slug" },
          { path: "groupcode", select: "name slug" },
          { path: "color", select: "name slug" },
          { path: "motif", select: "name slug" },
        ],
      })
      .populate({
        path: "location",
        populate: [
          { path: "country", select: "name code" },
          { path: "state", select: "name code" },
        ],
        // select: "name slug",
      })
      .lean();

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Public SEO details retrieved successfully",
      data: seo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting public SEO details",
      error: error.message,
    });
  }
};

// Get SEO by product slug with optional location parameters
// Get SEO by country slug with optional location parameters
const getSeoByCountry = async (req, res) => {
  try {
    const { countryslug } = req.params;
    const { state, city, location: locationSlug } = req.query;

    // Find country by slug
    const country = await mongoose
      .model("Country")
      .findOne({ slug: countryslug });
    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found with the given slug",
      });
    }

    // Function to find all SEO data with the given location query
    const findAllSeoWithLocation = async (locationQuery) => {
      const locations = await Location.find(locationQuery);
      if (!locations || locations.length === 0) return [];

      const locationIds = locations.map((loc) => loc._id);

      return await Seo.find({
        location: { $in: locationIds },
      })
        .populate({
          path: "product",
          populate: [
            { path: "category", select: "name slug" },
            { path: "substructure", select: "name slug" },
            { path: "content", select: "name slug" },
            { path: "design", select: "name slug" },
            { path: "subfinish", select: "name slug" },
            { path: "subsuitable", select: "name slug" },
            { path: "vendor", select: "name slug" },
            { path: "groupcode", select: "name code" },
            { path: "color", select: "name code" },
            { path: "motif", select: "name slug" },
          ],
        })
        .populate({
          path: "location",
          populate: [
            {
              path: "country",
              select: "name code slug",
              options: { lean: true },
            },
            {
              path: "state",
              select: "name code slug",
              options: { lean: true },
            },
            { path: "city", select: "name slug", options: { lean: true } },
          ],
        })
        .lean();
    };

    // Build location query based on provided parameters
    const locationQuery = { country: country._id };

    if (state) {
      const stateDoc = await mongoose.model("State").findOne({
        $or: [
          { slug: state },
          { _id: mongoose.Types.ObjectId.isValid(state) ? state : null },
        ],
      });
      if (stateDoc) locationQuery.state = stateDoc._id;
    }

    if (city) {
      const cityDoc = await mongoose.model("City").findOne({
        $or: [
          { slug: city },
          { _id: mongoose.Types.ObjectId.isValid(city) ? city : null },
        ],
      });
      if (cityDoc) locationQuery.city = cityDoc._id;
    }

    if (locationSlug) {
      locationQuery.slug = locationSlug;
    }

    // Function to try different location queries with fallback
    const tryLocationQueries = async () => {
      // Try with full location query first (country + state + city + location)
      let seoDataList = await findAllSeoWithLocation(locationQuery);

      // If no results, try without location slug
      if ((!seoDataList || seoDataList.length === 0) && locationSlug) {
        const queryWithoutLocation = { ...locationQuery };
        delete queryWithoutLocation.slug;
        seoDataList = await findAllSeoWithLocation(queryWithoutLocation);

        // If still no results, try without city
        if ((!seoDataList || seoDataList.length === 0) && city) {
          const queryWithoutCity = { ...queryWithoutLocation };
          delete queryWithoutCity.city;
          seoDataList = await findAllSeoWithLocation(queryWithoutCity);

          // If still no results, try with just country and state
          if ((!seoDataList || seoDataList.length === 0) && state) {
            const queryWithJustState = {
              country: locationQuery.country,
              state: locationQuery.state,
            };
            seoDataList = await findAllSeoWithLocation(queryWithJustState);
          }
        }
      }

      // If still no results, try with just the country
      if (!seoDataList || seoDataList.length === 0) {
        seoDataList = await findAllSeoWithLocation({ country: country._id });
      }

      return seoDataList || [];
    };

    // Find matching SEO data with fallback logic
    const seoDataList = await tryLocationQueries();

    // If no SEO data found after all fallbacks
    if (seoDataList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No SEO data found for the given location criteria",
      });
    }

    res.status(200).json({
      success: true,
      count: seoDataList.length,
      data: seoDataList,
    });
  } catch (error) {
    console.error("Error fetching SEO data by country:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching SEO data by country",
      error: error.message,
    });
  }
};

const getSeoByProductAndCountry = async (req, res) => {
  try {
    const { productslug, countryslug } = req.params;
    const { state, city, location: locationSlug } = req.query;

    // First, find the product by slug
    const product = await Product.findOne({ slug: productslug });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found with the given slug",
      });
    }

    // Find country by slug
    const country = await mongoose
      .model("Country")
      .findOne({ slug: countryslug });
    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found with the given slug",
      });
    }

    // Function to find all SEO data with the given location query
    const findAllSeoWithLocation = async (locationQuery) => {
      const locations = await Location.find(locationQuery);
      if (!locations || locations.length === 0) return [];

      const locationIds = locations.map((loc) => loc._id);

      return await Seo.find({
        product: product._id,
        location: { $in: locationIds },
      })
        .populate({
          path: "product",
          populate: [
            { path: "category", select: "name slug" },
            { path: "substructure", select: "name slug" },
            { path: "content", select: "name slug" },
            { path: "design", select: "name slug" },
            { path: "subfinish", select: "name slug" },
            { path: "subsuitable", select: "name slug" },
            { path: "vendor", select: "name slug" },
            { path: "groupcode", select: "name code" },
            { path: "color", select: "name code" },
            { path: "motif", select: "name slug" },
          ],
        })
        .populate({
          path: "location",
          populate: [
            {
              path: "country",
              select: "name code slug",
              options: { lean: true },
            },
            {
              path: "state",
              select: "name code slug",
              options: { lean: true },
            },
            { path: "city", select: "name slug", options: { lean: true } },
          ],
        })
        .lean();
    };

    // Build location query based on provided parameters
    const locationQuery = { country: country._id };

    if (state) {
      const stateDoc = await mongoose.model("State").findOne({
        $or: [
          { slug: state },
          { _id: mongoose.Types.ObjectId.isValid(state) ? state : null },
        ],
      });
      if (stateDoc) locationQuery.state = stateDoc._id;
    }

    if (city) {
      const cityDoc = await mongoose.model("City").findOne({
        $or: [
          { slug: city },
          { _id: mongoose.Types.ObjectId.isValid(city) ? city : null },
        ],
      });
      if (cityDoc) locationQuery.city = cityDoc._id;
    }

    if (locationSlug) {
      locationQuery.slug = locationSlug;
    }

    // Function to try different location queries with fallback
    const tryLocationQueries = async () => {
      // Try with full location query first (country + state + city + location)
      let seoDataList = await findAllSeoWithLocation(locationQuery);

      // If no results, try without location slug
      if ((!seoDataList || seoDataList.length === 0) && locationSlug) {
        const queryWithoutLocation = { ...locationQuery };
        delete queryWithoutLocation.slug;
        seoDataList = await findAllSeoWithLocation(queryWithoutLocation);

        // If still no results, try without city
        if ((!seoDataList || seoDataList.length === 0) && city) {
          const queryWithoutCity = { ...queryWithoutLocation };
          delete queryWithoutCity.city;
          seoDataList = await findAllSeoWithLocation(queryWithoutCity);

          // If still no results, try with just country and state
          if ((!seoDataList || seoDataList.length === 0) && state) {
            const queryWithJustState = {
              country: locationQuery.country,
              state: locationQuery.state,
            };
            seoDataList = await findAllSeoWithLocation(queryWithJustState);
          }
        }
      }

      // If still no results, try with just the country
      if (!seoDataList || seoDataList.length === 0) {
        seoDataList = await findAllSeoWithLocation({ country: country._id });
      }

      return seoDataList || [];
    };

    // Find matching SEO data with fallback logic
    const seoDataList = await tryLocationQueries();

    // If no SEO data found after all fallbacks
    if (seoDataList.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No SEO data found for the given product and location criteria",
      });
    }

    res.status(200).json({
      success: true,
      count: seoDataList.length,
      data: seoDataList,
    });
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching SEO data",
      error: error.message,
    });
  }
};

// Get SEO details with specific product fields for products with tag "astro"
const getSeoDetailsForAstroProducts = async (req, res) => {
  try {
    // Find all SEO entries and populate product
    const seoList = await Seo.find()
      .populate({
        path: "product",
        match: { productTag: "astro" }, // Only match products with "astro" tag
        select:
          "image1 image2 altimg1 altimg2 substructure content design subfinish subsuitable color motif gsm oz cm inch leadtime rating_count rating_value videourl videoalt ogType twitterCard",
        populate: [
          { path: "substructure", select: "name slug" },
          { path: "content", select: "name description" },
          { path: "design", select: "name slug" },
          { path: "subfinish", select: "name slug" },
          { path: "subsuitable", select: "name slug" },
          { path: "color", select: "name code" },
          { path: "motif", select: "name slug" },
        ],
      })
      .populate({
        path: "location",
        populate: [
          { path: "country", select: "name code slug" },
          { path: "state", select: "name code slug" },
          { path: "city", select: "name slug" },
        ],
      })
      .lean();

    // Filter out SEO entries where product is null (didn't match the "astro" tag)
    const filteredSeoList = seoList.filter((seo) => seo.product !== null);

    if (filteredSeoList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No SEO data found for products with tag "astro"',
      });
    }

    res.status(200).json({
      success: true,
      message:
        'SEO details for products with tag "astro" retrieved successfully',
      count: filteredSeoList.length,
      data: filteredSeoList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting SEO details for astro products",
      error: error.message,
    });
  }
};

module.exports = {
  createSeo,
  getAllSeo,
  getSeoById,
  getSeoByProduct,
  updateSeo,
  deleteSeo,

  getSeoBySlug,
  getSeoByLocation,

  searchSeos,
  getAllSeoPublic,
  getSeoBySlugPublic,
  getSeoByProductAndCountry,
  getSeoByCountry,
  getSeoDetailsForAstroProducts,
};
