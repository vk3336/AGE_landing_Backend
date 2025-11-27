const { body, validationResult } = require("express-validator");
const Groupcode = require("../model/Groupcode");
const { cloudinaryServices } = require("../services/cloudinary.service.js");
const slugify = require("slugify");
const Product = require("../model/Product");

// SEARCH GROUPCODES BY NAME
exports.searchGroupcodes = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Groupcode.find({
      name: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// Validator for creating a groupcode (name required)
exports.validateCreate = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .notEmpty()
    .withMessage("Name is required"),
  // Optional videourl (must be a URL if provided)
  body("videourl")
    .optional()
    .isURL()
    .withMessage("videourl must be a valid URL"),
  // Optional videoalt text
  body("videoalt")
    .optional()
    .isString()
    .withMessage("videoalt must be a string"),
];

// Validator for updating a groupcode (name optional)
exports.validateUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("videourl")
    .optional()
    .isURL()
    .withMessage("videourl must be a valid URL"),
  body("videoalt")
    .optional()
    .isString()
    .withMessage("videoalt must be a string"),
];

exports.create = async (req, res) => {
  // Debug log incoming data
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILES:", req.files);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const {
      name,
      altimg = "",
      altvideo = "",
      videourl = "",
      videoalt = "",
    } = req.body;
    let imgUrl = "";
    let videoUrl = "";
    // Upload image if present
    if (req.files && req.files.img && req.files.img[0]) {
      const imgResult = await cloudinaryServices.cloudinaryImageUpload(
        req.files.img[0].buffer,
        name + "-img",
        "groupcode"
      );
      // Transform the image URL to include width and height parameters
      imgUrl = imgResult.secure_url;
    }
    // Upload video if present
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await cloudinaryServices.cloudinaryVideoUpload(
        req.files.video[0].buffer,
        name + "-video",
        "groupcode"
      );
      videoUrl = videoResult.secure_url;
    }
    const newGroupcode = new Groupcode({
      name,
      img: imgUrl, // The URL will be transformed when fetched
      altimg,
      video: videoUrl,
      altvideo,
      videourl: videourl || videoUrl,
      videoalt: videoalt || altvideo,
    });
    await newGroupcode.save();
    res.status(201).json({
      success: true,
      message: "Groupcode created successfully",
      data: newGroupcode,
    });
  } catch (error) {
    console.error("Error creating groupcode:", error);
    res.status(500).json({
      success: false,
      message: "Error creating groupcode",
      error: error.message,
    });
  }
};

exports.viewAll = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1000;
    const page = parseInt(req.query.page) || 1;
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "";
    const skip = (page - 1) * limit;
    const items = await Groupcode.find({}, fields)
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.viewById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Groupcode.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { name, altimg, altvideo, videourl, videoalt } = req.body;
    const oldGroupcode = await Groupcode.findById(id).lean();
    let imgUrl = oldGroupcode?.img || "";
    let videoUrl = oldGroupcode?.video || "";
    // preserve existing videourl/videoalt unless overwritten
    let finalVideoUrl = oldGroupcode?.videourl || "";
    let finalVideoAlt = oldGroupcode?.videoalt || oldGroupcode?.altvideo || "";

    // Upload new image if present
    if (req.files && req.files.img && req.files.img[0]) {
      const imgResult = await cloudinaryServices.cloudinaryImageUpload(
        req.files.img[0].buffer,
        (name || oldGroupcode.name) + "-img",
        "groupcode"
      );
      if (imgResult && imgResult.secure_url) {
        // The URL will be transformed when fetched
        imgUrl = imgResult.secure_url;
      }
    }

    // Upload new video if present
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await cloudinaryServices.cloudinaryImageUpload(
        req.files.video[0].buffer,
        (name || oldGroupcode.name) + "-video",
        "groupcode",
        false,
        "video"
      );
      if (videoResult && videoResult.eager && videoResult.eager.length > 0) {
        videoUrl = videoResult.eager[0].secure_url || videoResult.secure_url;
      } else if (videoResult && videoResult.secure_url) {
        videoUrl = videoResult.secure_url;
      }
    }

    // If a new video was uploaded, prefer its URL for videourl unless an explicit videourl was provided
    if (videoUrl) finalVideoUrl = videoUrl;
    // If client provided explicit videourl in body, prefer that
    if (videourl !== undefined && videourl !== "") finalVideoUrl = videourl;
    // Determine final alt text for video: prefer explicit videoalt, then altvideo from body, then existing
    if (videoalt !== undefined && videoalt !== "") finalVideoAlt = videoalt;
    else if (altvideo !== undefined && altvideo !== "")
      finalVideoAlt = altvideo;

    // Prepare update data
    const updateData = {
      name,
      img: imgUrl,
      video: videoUrl,
      videourl: finalVideoUrl,
      videoalt: finalVideoAlt,
    };
    // Only set altimg if provided
    if (altimg !== undefined) updateData.altimg = altimg;

    const updated = await Groupcode.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deletion if referenced by any product
    const productUsing = await Product.findOne({ groupcode: id });
    if (productUsing) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: Groupcode is in use by one or more products.",
      });
    }
    const deleted = await Groupcode.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    // Delete associated files from Cloudinary
    const { img, video } = deleted;
    if (img) {
      const publicId = img.split("/").pop().split(".")[0];
      cloudinaryServices.cloudinaryImageDelete(publicId);
    }
    if (video) {
      const publicId = video.split("/").pop().split(".")[0];
      cloudinaryServices.cloudinaryImageDelete(publicId);
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete group code image
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the group code
    const groupcode = await Groupcode.findById(id);
    if (!groupcode) {
      return res
        .status(404)
        .json({ success: false, message: "Group code not found" });
    }

    // Check if group code has an image
    if (!groupcode.img) {
      return res.status(400).json({
        success: false,
        message: "Group code does not have an image to delete",
      });
    }

    try {
      // Extract public ID from the Cloudinary URL
      const urlParts = groupcode.img.split("/");
      const filename = urlParts[urlParts.length - 1];
      // Extract the public ID without the file extension
      const publicId = `groupcode/${filename.split(".")[0]}`;

      try {
        // First try to delete with the exact public ID
        await cloudinaryServices.cloudinaryImageDelete(publicId);
      } catch (cloudinaryError) {
        console.log(
          "First attempt failed, trying alternative public ID format..."
        );
        // If that fails, try with the full public ID from the URL
        const fullPublicId = `groupcode/${filename}`;
        await cloudinaryServices.cloudinaryImageDelete(fullPublicId);
      }

      // Update the group code to remove the image
      groupcode.img = undefined;
      await groupcode.save();

      res.status(200).json({
        success: true,
        message: "Group code image deleted successfully",
        groupcode,
      });
    } catch (error) {
      console.error("Error deleting group code image from Cloudinary:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting group code image from Cloudinary",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error in deleteImage:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting group code image",
      error: error.message,
    });
  }
};

module.exports = {
  create: exports.create,
  viewAll: exports.viewAll,
  viewById: exports.viewById,
  update: exports.update,
  deleteById: exports.deleteById,
  deleteImage: exports.deleteImage,
  validateCreate: exports.validateCreate,
  validateUpdate: exports.validateUpdate,
  searchGroupcodes: exports.searchGroupcodes,
};
