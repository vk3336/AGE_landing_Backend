const StaticSEO = require("../model/topicpage");
const Product = require("../model/Product");
const { validationResult } = require("express-validator");

// Create a new StaticSEO entry
exports.createStaticSEO = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const staticSEO = new StaticSEO(req.body);
    await staticSEO.save();

    res.status(201).json({
      success: true,
      data: staticSEO,
    });
  } catch (error) {
    next(error);
  }
};

// Get all StaticSEO entries
exports.getAllStaticSEO = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const staticSEOs = await StaticSEO.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staticSEOs.length,
      data: staticSEOs,
    });
  } catch (error) {
    next(error);
  }
};

// Get single StaticSEO entry by ID
exports.getStaticSEOById = async (req, res, next) => {
  try {
    const staticSEO = await StaticSEO.findById(req.params.id);

    if (!staticSEO) {
      throw new ApiError(404, "StaticSEO not found");
    }

    res.status(200).json({
      success: true,
      data: staticSEO,
    });
  } catch (error) {
    next(error);
  }
};

// Update StaticSEO entry
exports.updateStaticSEO = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const staticSEO = await StaticSEO.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!staticSEO) {
      throw new ApiError(404, "StaticSEO not found");
    }

    res.status(200).json({
      success: true,
      data: staticSEO,
    });
  } catch (error) {
    next(error);
  }
};

// Delete StaticSEO entry
exports.deleteStaticSEO = async (req, res, next) => {
  try {
    const staticSEO = await StaticSEO.findByIdAndDelete(req.params.id);

    if (!staticSEO) {
      throw new ApiError(404, "StaticSEO not found");
    }

    res.status(200).json({
      success: true,
      message: "StaticSEO deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get StaticSEO by slug
exports.getStaticSEOBySlug = async (req, res, next) => {
  try {
    const staticSEO = await StaticSEO.findOne({ slug: req.params.slug });

    if (!staticSEO) {
      throw new ApiError(404, "StaticSEO not found");
    }

    res.status(200).json({
      success: true,
      data: staticSEO,
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Details and Topic Page Data by Product Tag
exports.getProductAndTopicPageByTag = async (req, res, next) => {
  try {
    const tag = (
      req.params.productTag ||
      req.query.productTag ||
      req.body.productTag ||
      ""
    )
      .toString()
      .trim();

    if (!tag) {
      return res.status(400).json({
        success: false,
        message: "Product tag is required",
      });
    }

    // Escape regex special characters for safety
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeTag = escapeRegex(tag);

    // Match any array element equal to the tag (case-insensitive)
    const regex = new RegExp(`^${safeTag}$`, "i");

    // Fetch products by tag
    const products = await Product.find({ productTag: { $in: [regex] } })
      .populate("category", "name")
      .populate("substructure", "name")
      .populate("design", "name")
      .populate("content", "name")
      .populate("subfinish", "name")
      .populate("vendor", "name")
      .populate("groupcode", "name")
      .populate("color", "name")
      .populate("motif", "name")
      .lean();

    // Fetch topic page data by product tag
    const topicPageData = await StaticSEO.findOne({
      producttag: { $in: [regex] },
    }).lean();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for this product tag",
      });
    }

    return res.status(200).json({
      success: true,
      productTag: tag,
      productCount: products.length,
      data: {
        products: products,
        topicPage: topicPageData || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
