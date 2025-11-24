const author = require("../model/Author");
const { cloudinaryServices } = require("../services/cloudinary.service.js");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

exports.upload = upload;

exports.createauthor = async (req, res) => {
  try {
    let authorimageUrl;
    if (req.file) {
      const uploadResult = await cloudinaryServices.cloudinaryImageUpload(
        req.file.buffer,
        req.body.name || "author",
        "authorimage"
      );
      authorimageUrl = uploadResult.secure_url;
    }

    const author23 = new author({
      ...req.body,
      ...(authorimageUrl && { authorimage: authorimageUrl }),
    });
    await author23.save();
    res.status(201).json({ message: "author created", author23 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateauthor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      // Use provided name or fallback to existing author name
      const existing = await author.findById(req.params.id).lean();
      const filename = req.body.name || (existing && existing.name) || "author";
      const uploadResult = await cloudinaryServices.cloudinaryImageUpload(
        req.file.buffer,
        filename,
        "authorimage"
      );
      updateData.authorimage = uploadResult.secure_url;
    }

    const author23 = await author.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json({ message: "author updated", author23 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteauthor = async (req, res) => {
  try {
    await author.findByIdAndDelete(req.params.id);
    res.json({ message: "author deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getauthor = async (req, res) => {
  try {
    const author23 = await author.find();
    res.json(author23);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getauthorbyid = async (req, res) => {
  try {
    const author23 = await author.findById(req.params.id);
    res.json(author23);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
