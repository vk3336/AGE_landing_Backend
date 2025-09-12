const { body, validationResult } = require("express-validator");
const Substructure = require("../model/Substructure");
const Structure = require("../model/Structure");
const Product = require("../model/Product");

// SEARCH SUBSTRUCTURES BY NAME
exports.searchSubstructures = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Substructure.find({
      name: { $regex: safeQ, $options: "i" },
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

exports.validate = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .notEmpty()
    .withMessage("Name is required"),
  body("structure")
    .notEmpty()
    .withMessage("Structure reference is required")
    .isMongoId()
    .withMessage("Structure must be a valid Mongo ID")
    .custom(async (value) => {
      const exists = await Structure.exists({ _id: value });
      if (!exists) throw new Error("Referenced structure does not exist");
      return true;
    }),
];

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, structure } = req.body;
    const item = new Substructure({ name, structure });
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const items = await Substructure.find({}, fields)
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("structure", "name");
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.viewById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Substructure.findById(id).populate("structure", "name");
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
    const { name, structure } = req.body;
    const updateData = { name, structure };
    const updated = await Substructure.findByIdAndUpdate(id, updateData, {
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
    const productUsing = await Product.findOne({ substructure: id });
    if (productUsing) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete: Substructure is in use by one or more products.",
      });
    }
    const deleted = await Substructure.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  create: exports.create,
  viewAll: exports.viewAll,
  viewById: exports.viewById,
  update: exports.update,
  deleteById: exports.deleteById,
  validate: exports.validate,
  searchSubstructures: exports.searchSubstructures,
};
