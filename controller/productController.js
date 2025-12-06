const { body, validationResult } = require("express-validator");
const Product = require("../model/Product");

// Middleware to handle color array from form data
const handleColorArray = (req, res, next) => {
  // Handle color[] field (from form data)
  if (req.body["color[]"]) {
    // Convert to array if it's a single value
    req.body.color = Array.isArray(req.body["color[]"])
      ? req.body["color[]"]
      : [req.body["color[]"]];
    delete req.body["color[]"];
  }
  // Ensure color is always an array
  else if (req.body.color && !Array.isArray(req.body.color)) {
    req.body.color = [req.body.color];
  }
  // Filter out any empty values
  if (req.body.color) {
    req.body.color = req.body.color.filter(Boolean);
  }
  next();
};

// Middleware to handle subsuitable array from form data
const handleSubsuitableArray = (req, res, next) => {
  // Handle subsuitable[] field (from form data)
  if (req.body["subsuitable[]"]) {
    // Convert to array if it's a single value
    req.body.subsuitable = Array.isArray(req.body["subsuitable[]"])
      ? req.body["subsuitable[]"]
      : [req.body["subsuitable[]"]];
    delete req.body["subsuitable[]"];
  }
  // Ensure subsuitable is always an array if provided
  else if (req.body.subsuitable && !Array.isArray(req.body.subsuitable)) {
    req.body.subsuitable = [req.body.subsuitable];
  }
  // Filter out any empty values
  if (req.body.subsuitable) {
    req.body.subsuitable = req.body.subsuitable.filter(Boolean);
  }
  next();
};

// Middleware to handle leadtime array from form data
const handleLeadtimeArray = (req, res, next) => {
  // Handle leadtime[] field (from form data)
  if (req.body["leadtime[]"]) {
    // Convert to array if it's a single value
    req.body.leadtime = Array.isArray(req.body["leadtime[]"])
      ? req.body["leadtime[]"]
      : [req.body["leadtime[]"]];
    delete req.body["leadtime[]"];
  }
  // Ensure leadtime is always an array if provided
  else if (req.body.leadtime && !Array.isArray(req.body.leadtime)) {
    // Handle comma-separated strings
    if (
      typeof req.body.leadtime === "string" &&
      req.body.leadtime.includes(",")
    ) {
      req.body.leadtime = req.body.leadtime
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      req.body.leadtime = [req.body.leadtime];
    }
  }
  // Filter out any empty values
  if (req.body.leadtime) {
    req.body.leadtime = req.body.leadtime.filter(Boolean);
  }
  next();
};

// Middleware to handle productTag array from form data
const handleProductTagArray = (req, res, next) => {
  // Handle productTag[] field (from form data)
  if (req.body["productTag[]"]) {
    // Convert to array if it's a single value
    req.body.productTag = Array.isArray(req.body["productTag[]"])
      ? req.body["productTag[]"]
      : [req.body["productTag[]"]];
    delete req.body["productTag[]"];
  }
  // Ensure productTag is always an array if provided
  else if (req.body.productTag && !Array.isArray(req.body.productTag)) {
    // Handle comma-separated strings
    if (
      typeof req.body.productTag === "string" &&
      req.body.productTag.includes(",")
    ) {
      req.body.productTag = req.body.productTag
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      req.body.productTag = [req.body.productTag];
    }
  }
  // Filter out any empty values
  if (req.body.productTag) {
    req.body.productTag = req.body.productTag.filter(Boolean);
  }
  next();
};

const Substructure = require("../model/Substructure");
const Content = require("../model/Content");
const Design = require("../model/Design");
const Subfinish = require("../model/Subfinish");
const Vendor = require("../model/Vendor");
const Groupcode = require("../model/Groupcode");
const Color = require("../model/Color");
const Category = require("../model/Category");
const Motif = require("../model/Motif");
const Seo = require("../model/Seo");
const Topicpage = require("../model/topicpage");
const { cloudinaryServices } = require("../services/cloudinary.service.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Update multer middleware to accept any file field
const multiUpload = upload.any();
const slugify = require("slugify");
const path = require("path");
const ALLOWED_IMAGE_EXTENSIONS = (
  process.env.ALLOWED_IMAGE_EXTENSIONS || "jpg,jpeg,png,webp"
).split(",");
const ALLOWED_VIDEO_EXTENSIONS = (
  process.env.ALLOWED_VIDEO_EXTENSIONS || "mp4,webm"
).split(",");
const MAX_IMAGE_SIZE = process.env.MAX_IMAGE_SIZE
  ? parseInt(process.env.MAX_IMAGE_SIZE)
  : 5 * 1024 * 1024; // 5MB default
const MAX_VIDEO_SIZE = process.env.MAX_VIDEO_SIZE
  ? parseInt(process.env.MAX_VIDEO_SIZE)
  : 10 * 1024 * 1024; // 10MB default

function isValidExtension(filename, allowedExts) {
  const ext = path.extname(filename).replace(".", "").toLowerCase();
  return allowedExts.includes(ext);
}

// 🚀 VALIDATION - All fields are optional
const validate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid Mongo ID"),
  body("substructure")
    .optional()
    .isMongoId()
    .withMessage("Substructure must be a valid Mongo ID"),
  body("content")
    .optional()
    .isMongoId()
    .withMessage("Content must be a valid Mongo ID"),
  body("design")
    .optional()
    .isMongoId()
    .withMessage("Design must be a valid Mongo ID"),
  body("subfinish")
    .optional()
    .isMongoId()
    .withMessage("Subfinish must be a valid Mongo ID"),
  body("subsuitable")
    .optional()
    .isArray()
    .withMessage("Subsuitable must be an array of strings"),
  body("subsuitable.*")
    .optional()
    .isString()
    .withMessage("Each subsuitable item must be a string"),
  body("vendor")
    .optional()
    .isMongoId()
    .withMessage("Vendor must be a valid Mongo ID"),
  body("groupcode")
    .optional()
    .isMongoId()
    .withMessage("Groupcode must be a valid Mongo ID"),
  body("color").optional().isArray().withMessage("Color must be an array"),
  body("color.*")
    .optional()
    .isMongoId()
    .withMessage("Each color must be a valid Mongo ID"),
  body("motif")
    .optional()
    .isMongoId()
    .withMessage("Motif must be a valid Mongo ID"),
  body("um").optional().isString().withMessage("UM must be a string"),
  body("currency")
    .optional()
    .isString()
    .withMessage("Currency must be a string"),
  body("gsm").optional().isNumeric().withMessage("GSM must be a number"),
  body("oz").optional().isNumeric().withMessage("OZ must be a number"),
  body("cm").optional().isNumeric().withMessage("CM must be a number"),
  body("inch").optional().isNumeric().withMessage("Inch must be a number"),
  // Leadtime should be an array of strings (e.g. ["7 days", "14 days"]) if provided
  body("leadtime")
    .optional()
    .isArray()
    .withMessage("Leadtime must be an array"),
  body("leadtime.*")
    .optional()
    .isString()
    .withMessage("Each leadtime item must be a string"),
  // ProductTag should be an array of strings if provided
  body("productTag")
    .optional()
    .isArray()
    .withMessage("ProductTag must be an array"),
  body("productTag.*")
    .optional()
    .isString()
    .withMessage("Each productTag item must be a string"),
  // Video URL (optional) - if provided should be a valid URL
  body("videourl")
    .optional()
    .isURL()
    .withMessage("videourl must be a valid URL"),
  // Video alt text (optional)
  body("videoalt")
    .optional()
    .isString()
    .withMessage("videoalt must be a string"),
  // Product Q&A fields (all optional)
  body("productquestion1")
    .optional()
    .isString()
    .withMessage("productquestion1 must be a string"),
  body("productquestion2")
    .optional()
    .isString()
    .withMessage("productquestion2 must be a string"),
  body("productquestion3")
    .optional()
    .isString()
    .withMessage("productquestion3 must be a string"),
  body("productquestion4")
    .optional()
    .isString()
    .withMessage("productquestion4 must be a string"),
  body("productquestion5")
    .optional()
    .isString()
    .withMessage("productquestion5 must be a string"),
  body("productquestion6")
    .optional()
    .isString()
    .withMessage("productquestion6 must be a string"),
  body("productanswer1")
    .optional()
    .isString()
    .withMessage("productanswer1 must be a string"),
  body("productanswer2")
    .optional()
    .isString()
    .withMessage("productanswer2 must be a string"),
  body("productanswer3")
    .optional()
    .isString()
    .withMessage("productanswer3 must be a string"),
  body("productanswer4")
    .optional()
    .isString()
    .withMessage("productanswer4 must be a string"),
  body("productanswer5")
    .optional()
    .isString()
    .withMessage("productanswer5 must be a string"),
  body("productanswer6")
    .optional()
    .isString()
    .withMessage("productanswer6 must be a string"),
];

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    // Convert req.files array to object with fieldname keys if needed
    if (Array.isArray(req.files)) {
      const filesObj = {};
      for (const file of req.files) {
        if (!filesObj[file.fieldname]) filesObj[file.fieldname] = [];
        filesObj[file.fieldname].push(file);
      }
      req.files = filesObj;
    }
    // Debug: Log all request body and files for inspection
    console.log("[DEBUG] Product create request body:", req.body);
    console.log("[DEBUG] Product create request files:", req.files);
    // Validate image files
    const imageFields = ["file", "image1", "image2"];
    for (const field of imageFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const fileObj = req.files[field][0];
        if (fileObj.size > MAX_IMAGE_SIZE) {
          return res.status(400).json({
            success: false,
            message: `Image file size for ${field} exceeds limit (${
              MAX_IMAGE_SIZE / (1024 * 1024)
            }MB)`,
          });
        }
        if (!isValidExtension(fileObj.originalname, ALLOWED_IMAGE_EXTENSIONS)) {
          return res.status(400).json({
            success: false,
            message: `Invalid image extension for ${field}. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(
              ", "
            )}`,
          });
        }
      }
    }
    // Validate video file
    if (req.files && req.files.video && req.files.video[0]) {
      const videoObj = req.files.video[0];
      if (videoObj.size > MAX_VIDEO_SIZE) {
        return res.status(400).json({
          success: false,
          message: `Video file size exceeds limit (${
            MAX_VIDEO_SIZE / (1024 * 1024)
          }MB)`,
        });
      }
      if (!isValidExtension(videoObj.originalname, ALLOWED_VIDEO_EXTENSIONS)) {
        return res.status(400).json({
          success: false,
          message: `Invalid video extension. Allowed: ${ALLOWED_VIDEO_EXTENSIONS.join(
            ", "
          )}`,
        });
      }
    }
    const {
      name,
      category,
      substructure,
      content,
      design,
      subfinish,
      subsuitable,
      vendor,
      groupcode,
      color,
      motif,
      um,
      currency,
      gsm,
      oz,
      cm,
      inch,
      vendorFabricCode,
      leadtime,
      productTitle,
      productTagline,
      shortProductDescription,
      fullProductDescription,
      altimg1,
      altimg2,
      altimg3,
      altvideo,
      videourl,
      videoalt,
      productquestion1,
      productquestion2,
      productquestion3,
      productquestion4,
      productquestion5,
      productquestion6,
      productanswer1,
      productanswer2,
      productanswer3,
      productanswer4,
      productanswer5,
      productanswer6,
    } = req.body;
    // quantity removed — no longer stored on Product

    // 🚀 BATCH VALIDATION - Check all references in parallel if provided
    const validationPromises = [
      // Only validate category if provided
      category
        ? Category.exists({ _id: category }).then((exists) =>
            exists
              ? { field: "category", exists: true }
              : { field: "category", exists: false }
          )
        : Promise.resolve({ field: "category", exists: true }),

      // Only validate substructure if provided
      substructure
        ? Substructure.exists({ _id: substructure }).then((exists) =>
            exists
              ? { field: "substructure", exists: true }
              : { field: "substructure", exists: false }
          )
        : Promise.resolve({ field: "substructure", exists: true }),

      // Only validate content if provided
      content
        ? Content.exists({ _id: content }).then((exists) =>
            exists
              ? { field: "content", exists: true }
              : { field: "content", exists: false }
          )
        : Promise.resolve({ field: "content", exists: true }),

      // Only validate design if provided
      design
        ? Design.exists({ _id: design }).then((exists) =>
            exists
              ? { field: "design", exists: true }
              : { field: "design", exists: false }
          )
        : Promise.resolve({ field: "design", exists: true }),

      // Only validate subfinish if provided
      subfinish
        ? Subfinish.exists({ _id: subfinish }).then((exists) =>
            exists
              ? { field: "subfinish", exists: true }
              : { field: "subfinish", exists: false }
          )
        : Promise.resolve({ field: "subfinish", exists: true }),

      // Validate subsuitable as an array of non-empty strings (if provided)
      (async () => {
        if (!subsuitable) return { field: "subsuitable", exists: true };
        // Accept both single string and array, but prefer array
        const items = Array.isArray(subsuitable) ? subsuitable : [subsuitable];
        const invalid = items.filter((s) => typeof s !== "string" || !s.trim());
        if (invalid.length > 0) {
          return {
            field: "subsuitable",
            exists: false,
            message: `Invalid subsuitable values: ${invalid.join(", ")}`,
          };
        }
        return { field: "subsuitable", exists: true };
      })(),

      // Handle color validation - colors are optional but if provided, must be valid
      (async () => {
        if (color && Array.isArray(color) && color.length > 0) {
          try {
            const count = await Color.countDocuments({ _id: { $in: color } });
            console.log(
              `[DEBUG] Found ${count} valid colors out of ${color.length} requested`
            );
            if (count !== color.length) {
              const invalidColors = [];
              // Find which colors are invalid
              for (const colorId of color) {
                const exists = await Color.exists({ _id: colorId });
                if (!exists) {
                  invalidColors.push(colorId);
                }
              }
              console.error("Invalid color IDs:", invalidColors);
              return {
                field: "color",
                exists: false,
                message: `The following color IDs are invalid: ${invalidColors.join(
                  ", "
                )}`,
              };
            }
            return { field: "color", exists: true }; // All colors are valid
          } catch (error) {
            console.error("Error validating colors:", error);
            return {
              field: "color",
              exists: false,
              message: "Error validating colors",
            };
          }
        }
        return { field: "color", exists: true }; // No colors provided is also valid
      })(),

      // Only validate vendor if provided
      vendor
        ? Vendor.exists({ _id: vendor }).then((exists) =>
            exists
              ? { field: "vendor", exists: true }
              : { field: "vendor", exists: false }
          )
        : Promise.resolve({ field: "vendor", exists: true }),

      // Only validate groupcode if provided
      groupcode
        ? Groupcode.exists({ _id: groupcode }).then((exists) =>
            exists
              ? { field: "groupcode", exists: true }
              : { field: "groupcode", exists: false }
          )
        : Promise.resolve({ field: "groupcode", exists: true }),
    ];

    try {
      const validationResults = await Promise.all(validationPromises);

      // Filter out any invalid references
      const invalidRefs = validationResults.filter((result) => !result.exists);

      if (invalidRefs.length > 0) {
        console.error("Invalid references found:", invalidRefs);
        const errorMessages = invalidRefs
          .map((ref) => ref.message || `${ref.field} not found`)
          .join(". ");

        return res.status(400).json({
          success: false,
          message: errorMessages || "Some references are invalid",
          invalidReferences: invalidRefs,
        });
      }
    } catch (error) {
      console.error("Error during reference validation:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Error validating references",
        error: error.toString(),
      });
    }

    // Validate motif if provided
    if (motif) {
      const motifExists = await Motif.exists({ _id: motif });
      if (!motifExists) {
        return res
          .status(400)
          .json({ success: false, message: "Motif not found" });
      }
    }

    // Handle category folder naming (optional)
    let categoryFolder = "products"; // Default folder if no category
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
      categoryFolder = slugify(categoryDoc.name, {
        lower: true,
        strict: true,
      });
    }

    // Handle main image - can be either a new file or an existing URL
    let image3Url = req.body.image3 || "";
    // Check if a new file was uploaded
    const mainImageFile =
      (req.files && req.files.file && req.files.file[0]) ||
      (req.files && req.files.image3 && req.files.image3[0]);
    if (mainImageFile) {
      const uploadResult = await cloudinaryServices.cloudinaryImageUpload(
        mainImageFile.buffer,
        name,
        categoryFolder
      );
      console.log("[DEBUG] Cloudinary main image upload result:", uploadResult);
      if (uploadResult && uploadResult.secure_url) {
        image3Url = uploadResult.secure_url;
      } else if (uploadResult && uploadResult.error) {
        return res.status(500).json({
          success: false,
          message:
            "Image upload failed: " +
            (uploadResult.error.message || "Unknown error"),
        });
      }
    }

    // Handle image1 - can be either a new file or an existing URL
    let image1Url = req.body.image1 || "";
    if (req.files && req.files.image1 && req.files.image1[0]) {
      const upload1 = await cloudinaryServices.cloudinaryImageUpload(
        req.files.image1[0].buffer,
        name + "-image1",
        categoryFolder
      );
      console.log("[DEBUG] Cloudinary image1 upload result:", upload1);
      if (upload1 && upload1.secure_url) {
        image1Url = upload1.secure_url;
      } else if (upload1 && upload1.error) {
        console.error("Image1 upload failed:", upload1.error);
      }
    }

    // Handle image2 - can be either a new file or an existing URL
    let image2Url = req.body.image2 || "";
    if (req.files && req.files.image2 && req.files.image2[0]) {
      const upload2 = await cloudinaryServices.cloudinaryImageUpload(
        req.files.image2[0].buffer,
        name + "-image2",
        categoryFolder
      );
      console.log("[DEBUG] Cloudinary image2 upload result:", upload2);
      if (upload2 && upload2.secure_url) {
        image2Url = upload2.secure_url;
      } else if (upload2 && upload2.error) {
        console.error("Image2 upload failed:", upload2.error);
      }
    }

    // Handle video - can be either a new file or an existing URL
    let videoUrl = req.body.video || "";
    let videoThumbnailUrl = req.body.videoThumbnail || "";
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await cloudinaryServices.cloudinaryImageUpload(
        req.files.video[0].buffer,
        name + "-video",
        categoryFolder,
        false,
        "video"
      );
      console.log("[DEBUG] Cloudinary video upload result:", videoResult);
      // Extract AV1 video and thumbnail URLs
      if (videoResult) {
        if (videoResult.eager && videoResult.eager.length > 0) {
          videoUrl =
            videoResult.eager[0].secure_url ||
            videoResult.secure_url ||
            videoUrl;
          videoThumbnailUrl =
            videoResult.eager[1] && videoResult.eager[1].secure_url
              ? videoResult.eager[1].secure_url
              : videoThumbnailUrl;
        } else if (videoResult.secure_url) {
          videoUrl = videoResult.secure_url;
        }
      }
      if (videoResult && videoResult.error) {
        console.error("Video upload failed:", videoResult.error);
      }
    }
    // Normalize leadtime into an array of trimmed strings (remove falsy/empty)
    let leadtimeArr = undefined;
    if (typeof leadtime !== "undefined") {
      leadtimeArr = Array.isArray(leadtime) ? leadtime : [leadtime];
      leadtimeArr = leadtimeArr
        .map((v) => (v == null ? "" : String(v)))
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const product = new Product({
      name,
      image3: image3Url,
      image1: image1Url,
      image2: image2Url,
      video: videoUrl,
      videourl: videourl || videoUrl,
      videoThumbnail: videoThumbnailUrl,
      category,
      substructure,
      content,
      design,
      subfinish,
      subsuitable,
      leadtime: leadtimeArr,
      leadtime,
      vendor,
      groupcode,
      color,
      motif,
      um,
      currency,
      gsm,
      oz,
      cm,
      inch,
      vendorFabricCode,
      productTitle,
      productTagline,
      shortProductDescription,
      fullProductDescription,
      altimg1,
      altimg2,
      altimg3,
      altvideo,
      videoalt: videoalt || altvideo,
      productquestion1,
      productquestion2,
      productquestion3,
      productquestion4,
      productquestion5,
      productquestion6,
      productanswer1,
      productanswer2,
      productanswer3,
      productanswer4,
      productanswer5,
      productanswer6,
    });

    await product.save();

    // 🚀 OPTIMIZED POPULATION - Only populate essential fields
    const populated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("substructure", "name")
      .populate("content", "name")
      .populate("design", "name")
      .populate("subfinish", "name")
      .populate("vendor", "name")
      .populate("groupcode", "name")
      .populate("color", "name")
      .populate("motif", "name")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("🔥 Product creation error:", error.message);
    console.error("🔍 Stack:", error.stack);
    console.error("📦 Full error object:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || "Unknown error",
    });
  }
};

const viewAll = async (req, res) => {
  try {
    // 🚀 ULTRA-FAST PRODUCT QUERY OPTIMIZATIONS - NO LIMITS, ALL DATA
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "";

    // 🚀 GET ALL PRODUCTS - NO PAGINATION LIMITS
    let products = await Product.find({}, fields)
      .lean() // Convert to plain objects for speed
      .populate("category", "name")
      .populate("substructure", "name")
      .populate("content", "name")
      .populate("design", "name")
      .populate("subfinish", "name")
      .populate("vendor", "name")
      .populate("groupcode", "name")
      .populate("color", "name")
      .populate("motif", "name")
      .exec();

    res.status(200).json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error });
  }
};

const viewById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("substructure", "name")
      .populate("content", "name")
      .populate("design", "name")
      .populate("subfinish", "name")
      .populate("vendor", "name")
      .populate("groupcode", "name")
      .populate("color", "name")
      .populate("motif", "name");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error });
  }
};

// Helper function to validate uploaded files
const validateFile = (fileObj, allowedExts, maxSize, label) => {
  if (fileObj.size > maxSize) {
    throw new Error(
      `${label} file size exceeds limit (${Math.round(
        maxSize / (1024 * 1024)
      )}MB)`
    );
  }
  if (!isValidExtension(fileObj.originalname, allowedExts)) {
    throw new Error(
      `Invalid ${label} extension. Allowed: ${allowedExts.join(", ")}`
    );
  }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Normalize leadtime in updateData: allow single string or array, store as array of trimmed strings
    if (typeof updateData.leadtime !== "undefined") {
      const lt = updateData.leadtime;
      const arr = Array.isArray(lt) ? lt : [lt];
      const normalized = arr
        .map((v) => (v == null ? "" : String(v)))
        .map((s) => s.trim())
        .filter(Boolean);
      if (normalized.length > 0) updateData.leadtime = normalized;
      else delete updateData.leadtime;
    }

    // Normalize req.files (multer.any() => array) into { [fieldname]: File[] }
    if (Array.isArray(req.files)) {
      const filesObj = {};
      for (const file of req.files) {
        if (!filesObj[file.fieldname]) filesObj[file.fieldname] = [];
        filesObj[file.fieldname].push(file);
      }
      req.files = filesObj;
    }

    // quantity removed — ignore quantity updates coming in request body

    // Fetch the product to get old image URLs and category for folder
    const oldProduct = await Product.findById(id).lean();
    if (!oldProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    // Get category name for folder
    let categoryFolder = "products";
    if (updateData.category || oldProduct.category) {
      const categoryId = updateData.category || oldProduct.category;
      const categoryDoc = await Category.findById(categoryId);
      if (categoryDoc) {
        categoryFolder = slugify(categoryDoc.name, {
          lower: true,
          strict: true,
        });
      }
    }

    // ---- MEDIA UPDATES ----
    try {
      // Main image: accept 'file' or 'image3'
      const mainImageFile = req.files?.file?.[0] || req.files?.image3?.[0];

      if (mainImageFile) {
        validateFile(
          mainImageFile,
          ALLOWED_IMAGE_EXTENSIONS,
          MAX_IMAGE_SIZE,
          "image"
        );
        const uploaded = await cloudinaryServices.cloudinaryImageUpload(
          mainImageFile.buffer,
          req.body.name || oldProduct.name || "product",
          categoryFolder
        );
        if (uploaded?.secure_url) {
          if (oldProduct.image3) {
            const publicId = oldProduct.image3
              .split("/")
              .slice(-1)[0]
              .split(".")[0];
            cloudinaryServices
              .cloudinaryImageDelete(publicId)
              .catch(console.error);
          }
          updateData.image3 = uploaded.secure_url;
        }
      }

      // image1
      if (req.files?.image1?.[0]) {
        const f = req.files.image1[0];
        validateFile(f, ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE, "image1");
        const up = await cloudinaryServices.cloudinaryImageUpload(
          f.buffer,
          (req.body.name || oldProduct.name || "product") + "-image1",
          categoryFolder
        );
        if (up?.secure_url) {
          if (oldProduct.image1) {
            const publicId = oldProduct.image1
              .split("/")
              .slice(-1)[0]
              .split(".")[0];
            cloudinaryServices
              .cloudinaryImageDelete(publicId)
              .catch(console.error);
          }
          updateData.image1 = up.secure_url;
        }
      }

      // image2
      if (req.files?.image2?.[0]) {
        const f = req.files.image2[0];
        validateFile(f, ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE, "image2");
        const up = await cloudinaryServices.cloudinaryImageUpload(
          f.buffer,
          (req.body.name || oldProduct.name || "product") + "-image2",
          categoryFolder
        );
        if (up?.secure_url) {
          if (oldProduct.image2) {
            const publicId = oldProduct.image2
              .split("/")
              .slice(-1)[0]
              .split(".")[0];
            cloudinaryServices
              .cloudinaryImageDelete(publicId)
              .catch(console.error);
          }
          updateData.image2 = up.secure_url;
        }
      }

      // video
      if (req.files?.video?.[0]) {
        const vf = req.files.video[0];
        validateFile(vf, ALLOWED_VIDEO_EXTENSIONS, MAX_VIDEO_SIZE, "video");
        const vUp = await cloudinaryServices.cloudinaryImageUpload(
          vf.buffer,
          (req.body.name || oldProduct.name || "product") + "-video",
          categoryFolder,
          false,
          "video" // ensure resource_type 'video'
        );
        if (vUp) {
          // Use eager[0] as in create(), fallback to secure_url
          updateData.video =
            (vUp.eager && vUp.eager[0]?.secure_url) || vUp.secure_url || "";
          updateData.videoThumbnail =
            (vUp.eager && vUp.eager[1]?.secure_url) ||
            updateData.videoThumbnail ||
            "";
          // Delete old video if exists
          if (oldProduct.video) {
            const publicId = oldProduct.video
              .split("/")
              .slice(-1)[0]
              .split(".")[0];
            cloudinaryServices
              .cloudinaryImageDelete(publicId, "video")
              .catch(console.error);
          }
        }
      }
    } catch (mediaErr) {
      return res
        .status(400)
        .json({ success: false, message: mediaErr.message });
    }

    // 🚀 BATCH VALIDATION if references are being updated
    if (
      updateData.category ||
      updateData.substructure ||
      updateData.content ||
      updateData.design ||
      updateData.subfinish ||
      updateData.subsuitable ||
      updateData.vendor ||
      updateData.groupcode ||
      updateData.color ||
      updateData.motif
    ) {
      const validationPromises = [];
      if (updateData.category)
        validationPromises.push(Category.exists({ _id: updateData.category }));
      if (updateData.substructure)
        validationPromises.push(
          Substructure.exists({ _id: updateData.substructure })
        );
      if (updateData.content)
        validationPromises.push(Content.exists({ _id: updateData.content }));
      if (updateData.design)
        validationPromises.push(Design.exists({ _id: updateData.design }));
      if (updateData.subfinish)
        validationPromises.push(
          Subfinish.exists({ _id: updateData.subfinish })
        );
      if (updateData.subsuitable)
        validationPromises.push(
          (async () => {
            const items = Array.isArray(updateData.subsuitable)
              ? updateData.subsuitable
              : [updateData.subsuitable];
            const invalid = items.filter(
              (s) => typeof s !== "string" || !s.trim()
            );
            return invalid.length === 0;
          })()
        );
      if (updateData.vendor)
        validationPromises.push(Vendor.exists({ _id: updateData.vendor }));
      if (updateData.groupcode)
        validationPromises.push(
          Groupcode.exists({ _id: updateData.groupcode })
        );
      if (updateData.color) {
        // Handle both array and single color cases
        const colors = Array.isArray(updateData.color)
          ? updateData.color
          : [updateData.color];
        validationPromises.push(
          (async () => {
            const count = await Color.countDocuments({ _id: { $in: colors } });
            return count === colors.length;
          })()
        );
      }
      if (updateData.motif)
        validationPromises.push(Motif.exists({ _id: updateData.motif }));

      if (validationPromises.length > 0) {
        const validationResults = await Promise.all(validationPromises);
        const invalidRefs = validationResults.filter((exists) => !exists);
        if (invalidRefs.length > 0) {
          return res.status(400).json({
            success: false,
            message: "One or more referenced entities do not exist",
          });
        }
      }
    }

    // Sanitize updateData
    Object.keys(updateData).forEach(
      (key) =>
        (updateData[key] === "" ||
          updateData[key] === undefined ||
          updateData[key] === null) &&
        delete updateData[key]
    );

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate([
        { path: "category", select: "name" },
        { path: "substructure", select: "name" },
        { path: "content", select: "name" },
        { path: "design", select: "name" },
        { path: "subfinish", select: "name" },
        { path: "vendor", select: "name" },
        { path: "groupcode", select: "name" },
        { path: "color", select: "name" },
        { path: "motif", select: "name" },
      ])
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deletion if referenced by any SEO
    const seoUsing = await Seo.findOne({ product: id });
    if (seoUsing) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: Product is in use by one or more SEO records.",
      });
    }
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    // Remove image file
    if (deleted.image3) {
      const publicId = deleted.image3.split("/").pop().split(".")[0];
      await cloudinaryServices.cloudinaryImageDelete(publicId);
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SEARCH PRODUCTS BY NAME OR SLUG
const searchProducts = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Product.find({
      $or: [
        { name: { $regex: safeQ, $options: "i" } },
        { slug: { $regex: safeQ, $options: "i" } },
      ],
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// GET ALL PRODUCTS BY GROUPCODE ID
const getProductsByGroupcode = async (req, res, next) => {
  const { groupcodeId } = req.params;
  try {
    const products = await Product.find({ groupcode: groupcodeId });
    if (products.length === 0) {
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this group code" });
    }
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY CATEGORY ID
const getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.categoryId });
    if (!products.length)
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this category" });
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY CONTENT ID
const getProductsByContent = async (req, res, next) => {
  try {
    const products = await Product.find({ content: req.params.contentId });
    if (!products.length)
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this content" });
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY DESIGN ID
const getProductsByDesign = async (req, res, next) => {
  try {
    const products = await Product.find({ design: req.params.designId });
    if (!products.length)
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this design" });
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY COLOR ID
const getProductsByColor = async (req, res, next) => {
  try {
    const products = await Product.find({ color: req.params.colorId });
    if (!products.length)
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this color" });
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY MOTIF ID
const getProductsByMotif = async (req, res, next) => {
  try {
    const products = await Product.find({ motif: req.params.motifId });
    if (!products.length)
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this motif" });
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY VENDOR ID
const getProductsByVendor = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId });
    if (!products.length)
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this vendor" });
    res.status(200).json({ status: 1, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY PRODUCT TAG (case-insensitive match against items in productTag array)
const productByProductTag = async (req, res, next) => {
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
      return res
        .status(400)
        .json({ status: 0, message: "productTag is required" });
    }

    // Escape regex special characters for safety
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeTag = escapeRegex(tag);

    // Match any array element equal to the tag (case-insensitive)
    const regex = new RegExp(`^${safeTag}$`, "i");
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

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ status: 0, message: "No products found for this productTag" });
    }

    return res
      .status(200)
      .json({ status: 1, total: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY GSM RANGE
const getProductsByGsmValue = async (req, res, next) => {
  const value = Number(req.params.value);
  try {
    if (isNaN(value))
      return res.status(400).json({ status: 0, message: "Invalid GSM value" });
    const range = value * 0.15;
    const min = value - range;
    const max = value + range;
    const matched = await Product.find({ gsm: { $gte: min, $lte: max } });
    if (!matched.length)
      return res
        .status(404)
        .json({ status: 0, message: "No GSM products found in range" });
    res.status(200).json({ status: 1, data: matched });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY OZ RANGE
const getProductsByOzValue = async (req, res, next) => {
  const value = Number(req.params.value);
  try {
    if (isNaN(value))
      return res.status(400).json({ status: 0, message: "Invalid OZ value" });
    const range = value * 0.15;
    const min = value - range;
    const max = value + range;
    const matched = await Product.find({ oz: { $gte: min, $lte: max } });
    if (!matched.length)
      return res
        .status(404)
        .json({ status: 0, message: "No OZ products found in range" });
    res.status(200).json({ status: 1, data: matched });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY INCH RANGE
const getProductsByInchValue = async (req, res, next) => {
  const value = Number(req.params.value);
  try {
    if (isNaN(value))
      return res.status(400).json({ status: 0, message: "Invalid Inch value" });
    const range = value * 0.15;
    const min = value - range;
    const max = value + range;
    const query = { inch: { $gte: min, $lte: max } };
    const matched = await Product.find(query);
    // Transform image URLs for all matched products
    const transformedProducts = matched.map((product) => {
      // Handle both Mongoose documents and plain objects
      return typeof product.toObject === "function"
        ? product.toObject()
        : product;
    });
    res.status(200).json({ status: 1, data: transformedProducts });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS BY CM RANGE
const getProductsByCmValue = async (req, res, next) => {
  const value = Number(req.params.value);
  try {
    if (isNaN(value))
      return res.status(400).json({ status: 0, message: "Invalid CM value" });
    const range = value * 0.15;
    const min = value - range;
    const max = value + range;
    const matched = await Product.find({ cm: { $gte: min, $lte: max } });
    if (!matched.length)
      return res
        .status(404)
        .json({ status: 0, message: "No CM products found in range" });
    res.status(200).json({ status: 1, data: matched });
  } catch (error) {
    next(error);
  }
};

// Quantity-based product filtering removed — `quantity` field no longer exists on Product

// GET PRODUCT BY SLUG
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: 0,
        message: "Product slug is required",
      });
    }

    const product = await Product.findOne({ slug })
      .populate("category")
      .populate("substructure")
      .populate("content")
      .populate("design")
      .populate("subfinish")
      .populate("vendor")
      .populate("groupcode")
      .populate("color")
      .populate("motif");

    if (!product) {
      return res.status(404).json({
        status: 0,
        message: "Product not found",
      });
    }

    // Transform image URLs before sending response
    const productObj =
      typeof product.toObject === "function" ? product.toObject() : product;

    res.status(200).json({
      status: 1,
      data: productObj,
    });
  } catch (error) {
    console.error("Error getting product by slug:", error);
    next(error);
  }
};

// GET ALL PRODUCTS WITHOUT VENDOR INFORMATION
const getAllProductsExceptVendor = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("-vendor") // Exclude vendor field

      .lean();

    res.status(200).json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PRODUCT BY SLUG WITHOUT VENDOR INFO
const getPublicProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: 0,
        message: "Product slug is required",
      });
    }

    const product = await Product.findOne({ slug })
      .select("-vendor") // Exclude vendor field
      .populate("category")
      .populate("substructure")
      .populate("content")
      .populate("design")
      .populate("subfinish")
      .populate("groupcode")
      .populate("color")
      .populate("motif")
      .lean();

    if (!product) {
      return res.status(404).json({
        status: 0,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: 1,
      data: product,
    });
  } catch (error) {
    console.error("Error getting public product by slug:", error);
    next(error);
  }
};

// Note: Popular/top-rated/landing/shopy product flags and endpoints
// have been removed from the Product schema. Corresponding
// endpoints were removed to avoid referencing deleted fields.

// Get product by productIdentifier
const getproductByProductIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Find product by vendorFabricCode
    const product = await Product.findOne({
      vendorFabricCode: identifier,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found with the given identifier",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product by identifier:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  multiUpload,
  handleColorArray,
  handleSubsuitableArray,
  handleLeadtimeArray,
  create,
  viewAll,
  viewById,
  update,
  deleteById,
  validate,
  getproductByProductIdentifier,
  searchProducts,
  getProductsByGroupcode,
  getProductsByCategory,
  getProductsByContent,
  getProductsByDesign,
  getProductsByColor,
  getProductsByMotif,
  getProductsByVendor,
  productByProductTag,
  getProductsByGsmValue,
  getProductsByOzValue,
  getProductsByInchValue,
  getProductsByCmValue,
  getProductBySlug,
  getAllProductsExceptVendor,
  getPublicProductBySlug,
  deleteProductImage,
};

// DELETE PRODUCT IMAGE
async function deleteProductImage(req, res) {
  try {
    const { id, imageName } = req.params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Determine which image field contains the image to delete
    const imageFields = ["image3", "image1", "image2"];
    let imageDeleted = false;

    for (const field of imageFields) {
      if (product[field] && product[field].includes(imageName)) {
        try {
          // Extract public ID from the Cloudinary URL
          // The public ID is the part of the URL after the last slash and before the file extension
          const urlParts = product[field].split("/");
          const filename = urlParts[urlParts.length - 1];
          const publicId = filename.split(".")[0]; // Remove file extension

          // Delete the image from Cloudinary
          await cloudinaryServices.cloudinaryImageDelete(publicId);

          // Remove the image URL from the product
          product[field] = undefined;
          await product.save();

          imageDeleted = true;
          break;
        } catch (error) {
          console.error(
            `Error deleting ${field} image from Cloudinary:`,
            error
          );
          return res.status(500).json({
            success: false,
            message: `Error deleting ${field} image from Cloudinary`,
          });
        }
      }
    }

    if (!imageDeleted) {
      return res.status(404).json({
        success: false,
        message: "Image not found in product",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting image",
    });
  }
}
