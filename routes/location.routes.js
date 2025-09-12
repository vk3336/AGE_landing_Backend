const express = require("express");
const locationController = require("../controller/location.controller");
const router = express.Router();

// Get all locations
router.get("/", locationController.getAllLocations);

// Search locations by name
router.get("/search/:q", locationController.searchLocations);

// Get location by ID or slug
router.get("/:id", locationController.getLocation);

// Create a new location
router.post("/", locationController.createLocation);

// Update a location
router.put("/:id", locationController.updateLocation);

// Delete a location
router.delete("/:id", locationController.deleteLocation);

module.exports = router;
