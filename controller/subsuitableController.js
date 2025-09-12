const { body, validationResult } = require("express-validator");
const Subsuitable = require("../model/Subsuitable");
const Suitablefor = require("../model/Suitablefor");
const Product = require("../model/Product");

// SEARCH SUBSUITABLES BY NAME
exports.searchSubsuitables = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Subsuitable.find({
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
  body("suitablefor").custom(async (value) => {
    // Convert single value to array if needed
    const values = Array.isArray(value) ? value : [value];

    if (values.length === 0) {
      throw new Error("Suitablefor must have at least one item");
    }

    // Check if all values are valid MongoDB ObjectIds
    for (const val of values) {
      if (!/^[0-9a-fA-F]{24}$/.test(val)) {
        throw new Error(`Invalid MongoDB ObjectId: ${val}`);
      }
      // Check if each referenced suitablefor exists
      const exists = await Suitablefor.exists({ _id: val });
      if (!exists) {
        throw new Error(`Referenced suitablefor does not exist: ${val}`);
      }
    }
    return true;
  }),
];

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { name, suitablefor } = req.body;
    // Convert single value to array if needed
    const suitableforArray = Array.isArray(suitablefor)
      ? suitablefor
      : [suitablefor];
    const item = new Subsuitable({ name, suitablefor: suitableforArray });
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
    const items = await Subsuitable.find({}, fields)
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("suitablefor", "name");
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.viewById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Subsuitable.findById(id).populate("suitablefor", "name");
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
    const { name, suitablefor } = req.body;
    // Convert single value to array if needed
    const suitableforArray = Array.isArray(suitablefor)
      ? suitablefor
      : [suitablefor];
    const updateData = { name, suitablefor: suitableforArray };
    const updated = await Subsuitable.findByIdAndUpdate(id, updateData, {
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
    const productUsing = await Product.findOne({ subsuitable: id });
    if (productUsing) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete: Subsuitable is in use by one or more products.",
      });
    }
    const deleted = await Subsuitable.findByIdAndDelete(id);
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
  searchSubsuitables: exports.searchSubsuitables,
};
