const express = require("express");
const countryController = require("../controller/country.controller");
const router = express.Router();

router.post("/", countryController.createCountry);
router.get("/", countryController.getAllCountries);
router.get("/search/:q", countryController.searchCountries);
router.get("/:id", countryController.getCountry);
router.put("/:id", countryController.updateCountry);
router.delete("/:id", countryController.deleteCountry);
router.get("/slug/:slug", countryController.findBySlug);

module.exports = router;
