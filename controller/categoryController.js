const mongoose = require("mongoose");
const Category = require("../model/Category");
const { body, validationResult } = require("express-validator");
const { cloudinaryServices } = require("../services/cloudinary.service.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const Product = require("../model/Product");
const { transformCategoryImages } = require("../utils/categoryImageUtils");
const { transformImageUrl } = require("../utils/imageUtils");

// SEARCH CATEGORIES BY NAME
const searchCategories = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Category.find({
      name: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// Validation middleware
const validate = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .notEmpty()
    .withMessage("Name is required"),
];

// Create category controller - ULTRA FAST
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, altimg } = req.body;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    // 🚀 PARALLEL OPERATIONS - Upload image and check for duplicate name
    const [uploadResult, existingCategory] = await Promise.all([
      cloudinaryServices.cloudinaryImageUpload(
        req.file.buffer,
        name,
        "categories"
      ),
      Category.findOne({ name }).lean(),
    ]);

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // Transform the image URL to include width and height parameters
    const image = transformImageUrl(uploadResult.secure_url);
    const category = new Category({ 
      name, 
      image, 
      ...(altimg && { altimg }) // Only include altimg if it exists
    });
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View all categories - ULTRA FAST
const viewAllCategories = async (req, res) => {
  try {
    // 🚀 ULTRA-FAST CATEGORY QUERY OPTIMIZATIONS
    const limit = parseInt(req.query.limit) || 100; // Increased default limit
    const page = parseInt(req.query.page) || 1;
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "";
    const skip = (page - 1) * limit;

    // PARALLEL EXECUTION for faster queries
    const [categories, total] = await Promise.all([
      Category.find({}, fields)
        .skip(skip)
        .limit(limit)
        .lean() // Convert to plain objects for speed
        .exec(),
      Category.countDocuments(),
    ]);

    // Transform image URLs
    const transformedCategories = transformCategoryImages(categories);

    res.status(200).json({
      success: true,
      data: transformedCategories,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View category by ID
const viewCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
  
    // Transform image URL before sending response
    const transformedCategory = transformCategoryImages(category);
    res.status(200).json({ success: true, data: transformedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete category by ID (and remove image file)
const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if any product references this category
    const productUsingCategory = await Product.findOne({ category: id });
    if (productUsingCategory) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: Category is in use by one or more products.",
      });
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // Image deletion handled by Cloudinary
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update category by ID (optionally update image)
const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { name, altimg } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (altimg !== undefined) updateData.altimg = altimg;
    // If there's a new image, upload it
    if (req.file) {
      const uploadResult = await cloudinaryServices.cloudinaryImageUpload(
        req.file.buffer,
        name || (await Category.findById(id)).name, // Get category name if name is not provided
        'categories'
      );
      // Transform the image URL to include width and height parameters
      updateData.image = transformImageUrl(uploadResult.secure_url);
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // Transform image URL before sending response
    const transformedCategory = transformCategoryImages(updatedCategory);
    res.status(200).json({ success: true, data: transformedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete category image
const deleteCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check if category has an image
    if (!category.image) {
      return res.status(400).json({
        success: false,
        message: "Category does not have an image to delete",
      });
    }

    // Extract public ID from the Cloudinary URL
    const urlParts = category.image.split("/");
    const filename = urlParts[urlParts.length - 1];
    const publicId = `categories/${filename.split(".")[0]}`; // Include 'categories' folder

    try {
      // Delete the image from Cloudinary
      await cloudinaryServices.cloudinaryImageDelete(publicId);

      // Update the category to remove the image
      category.image = undefined;
      await category.save();

      res.status(200).json({
        success: true,
        message: "Category image deleted successfully",
        category,
      });
    } catch (error) {
      console.error("Error deleting category image from Cloudinary:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting category image from Cloudinary",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error in deleteCategoryImage:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category image",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  createCategory,
  viewAllCategories,
  viewCategoryById,
  deleteCategoryById,
  updateCategory,
  deleteCategoryImage,
  validate,
  searchCategories
};
