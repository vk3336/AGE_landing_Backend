const AboutUs = require("../model/AboutUs");

// Get all About Us content
exports.getAboutUs = async (req, res) => {
  try {
    const aboutUsList = await AboutUs.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { aboutUs: aboutUsList },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create new About Us content
exports.createAboutUs = async (req, res) => {
  try {
    const { descriptionsmall, descriptionmedium, descriptionlarger } = req.body;

    const aboutUs = await AboutUs.create({
      descriptionsmall,
      descriptionmedium,
      descriptionlarger,
    });

    res.status(201).json({
      status: "success",
      data: { aboutUs },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update About Us content
exports.updateAboutUs = async (req, res) => {
  try {
    const { id } = req.params;
    const { descriptionsmall, descriptionmedium, descriptionlarger } = req.body;

    const aboutUs = await AboutUs.findByIdAndUpdate(
      id,
      { descriptionsmall, descriptionmedium, descriptionlarger },
      { new: true, runValidators: true }
    );

    if (!aboutUs) {
      return res.status(404).json({
        status: "error",
        message: "No about us content found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: { aboutUs },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete About Us content
exports.deleteAboutUs = async (req, res) => {
  try {
    const { id } = req.params;

    const aboutUs = await AboutUs.findByIdAndDelete(id);

    if (!aboutUs) {
      return res.status(404).json({
        status: "error",
        message: "No about us content found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
