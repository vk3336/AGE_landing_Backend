const express = require("express");
const router = express.Router();
const {
  createOfficeInformation,
  getAllOfficeInformation,
  getOfficeInformationById,
  updateOfficeInformation,
  deleteOfficeInformation,
} = require("../controller/officeInformationController");

// Create office information
router.post("/", createOfficeInformation);

// Get all office information
router.get("/", getAllOfficeInformation);

// Get office information by ID
router.get("/:id", getOfficeInformationById);

// Update office information
router.put("/:id", updateOfficeInformation);

// Delete office information
router.delete("/:id", deleteOfficeInformation);

module.exports = router;
