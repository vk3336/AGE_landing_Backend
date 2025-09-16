const OfficeInformation = require("../model/OfficeInformation");

// Create office information
const createOfficeInformation = async (req, res) => {
  try {
    const officeInfo = new OfficeInformation(req.body);
    await officeInfo.save();
    res.status(201).json({
      success: true,
      message: "Office information created successfully",
      data: officeInfo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating office information",
      error: error.message,
    });
  }
};

// Get all office information entries
const getAllOfficeInformation = async (req, res) => {
  try {
    const officeInfo = await OfficeInformation.find().lean();
    res.status(200).json({
      success: true,
      data: officeInfo,
      total: officeInfo.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting office information",
      error: error.message,
    });
  }
};

// Get office information by ID
const getOfficeInformationById = async (req, res) => {
  try {
    const officeInfo = await OfficeInformation.findById(req.params.id);
    if (!officeInfo) {
      return res.status(404).json({
        success: false,
        message: "Office information not found",
      });
    }
    res.status(200).json({
      success: true,
      data: officeInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting office information",
      error: error.message,
    });
  }
};

// Update office information
const updateOfficeInformation = async (req, res) => {
  try {
    const officeInfo = await OfficeInformation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!officeInfo) {
      return res.status(404).json({
        success: false,
        message: "Office information not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Office information updated successfully",
      data: officeInfo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating office information",
      error: error.message,
    });
  }
};

// Delete office information
const deleteOfficeInformation = async (req, res) => {
  try {
    const officeInfo = await OfficeInformation.findByIdAndDelete(req.params.id);
    if (!officeInfo) {
      return res.status(404).json({
        success: false,
        message: "Office information not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Office information deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting office information",
      error: error.message,
    });
  }
};

module.exports = {
  createOfficeInformation,
  getAllOfficeInformation,
  getOfficeInformationById,
  updateOfficeInformation,
  deleteOfficeInformation,
};
