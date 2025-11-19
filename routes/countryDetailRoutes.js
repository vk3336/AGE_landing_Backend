const express = require("express");
const router = express.Router();
const countryDetailController = require("../controller/countryDetailController");

// Create country
router.post("/", countryDetailController.createCountry);

// Get all countries
router.get("/", countryDetailController.getAllCountries);

// Get country by ID
router.get("/:id", countryDetailController.getCountryById);

// Update country
router.put("/:id", countryDetailController.updateCountry);

// Delete country
router.delete("/:id", countryDetailController.deleteCountry);

module.exports = router;
