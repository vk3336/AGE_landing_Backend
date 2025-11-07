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
  getSeoBySlugPublic
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


// Get SEO by slug"
router.get("/slug/:slug", getSeoBySlug);

// Get SEO by product ID
router.get("/product/:productId", getSeoByProduct);

// Get SEO by location ID
router.get("/location/:locationId", getSeoByLocation);

// Get SEO by ID (with product populated)
router.get("/:id", getSeoById);

// Update SEO
router.put("/:id", updateSeo);

// Delete SEO
router.delete("/:id", deleteSeo);

module.exports = router;
