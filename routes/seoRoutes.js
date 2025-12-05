const express = require("express");
const router = express.Router();
const {
  createSeo,
  getAllSeo,
  getSeoById,
  getSeoByProduct,
  getSeoByLocation,
  updateSeo,
  deleteSeo,
  getSeoBySlug,
  searchSeos,
  getAllSeoPublic,
  getSeoBySlugPublic,
  getSeoByProductAndCountry,
  getSeoByCountry,
  getSeoDetailsForAstroProducts,
} = require("../controller/seoController");

router.get("/search/:q", searchSeos);

// Create SEO
router.post("/", createSeo);

// Get all SEO
router.get("/", getAllSeo);

// Get all SEO without purchase price (public)
router.get("/public", getAllSeoPublic);

// Get SEO by slug without purchase price (public)
router.get("/public/slug/:slug", getSeoBySlugPublic);

// Get SEO details for products with tag "astro"
router.get("/astro/products", getSeoDetailsForAstroProducts);

// Get SEO by slug"
router.get("/slug/:slug", getSeoBySlug);

// Get SEO by product ID
router.get("/product/:productId", getSeoByProduct);

// Get SEO by location ID
router.get("/location/:locationId", getSeoByLocation);

// Get SEO by country slug with optional location parameters (state, city, location)
router.get("/country/:countryslug", getSeoByCountry);

// Get SEO by product slug with optional location parameters
router.get("/:productslug/:countryslug", getSeoByProductAndCountry);

// Get SEO by ID (with product populated)
router.get("/:id", getSeoById);

// Update SEO
router.put("/:id", updateSeo);

// Delete SEO
router.delete("/:id", deleteSeo);

module.exports = router;
