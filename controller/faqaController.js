const FAQA = require("../model/FAQA");

// Create FAQA
const createFAQA = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faqa = new FAQA({ question, answer });
    await faqa.save();
    res.status(201).json({ success: true, data: faqa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View all FAQAs
const viewAllFAQA = async (req, res) => {
  try {
    const faqa = await FAQA.find();
    res.status(200).json({ success: true, data: faqa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View FAQA by ID
const viewFAQAById = async (req, res) => {
  try {
    const faqa = await FAQA.findById(req.params.id);
    if (!faqa) {
      return res
        .status(404)
        .json({ success: false, message: "FAQA not found" });
    }
    res.status(200).json({ success: true, data: faqa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update FAQA
const updateFAQA = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faqa = await FAQA.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    if (!faqa) {
      return res
        .status(404)
        .json({ success: false, message: "FAQA not found" });
    }
    res.status(200).json({ success: true, data: faqa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete FAQA
const deleteFAQA = async (req, res) => {
  try {
    const faqa = await FAQA.findByIdAndDelete(req.params.id);
    if (!faqa) {
      return res
        .status(404)
        .json({ success: false, message: "FAQA not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "FAQA deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFAQA,
  viewAllFAQA,
  viewFAQAById,
  updateFAQA,
  deleteFAQA,
};
