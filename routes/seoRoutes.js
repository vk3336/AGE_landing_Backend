const express = require("express");
const router = express.Router();
const {
  createSeo,
  getAllSeo,
  getSeoById,
  getSeoByProduct,
  updateSeo,
  deleteSeo,
  getPopularProducts,
  getTopRatedProducts,
  getSeoBySlug,
  getSeoByProductIdentifier,
  getSeoBySalesPriceValue,
  getSeoByPurchasePriceValue,
  getSeoByIdNoPopulate,
} = require("../controller/seoController");

// Create SEO
router.post("/", createSeo);

// Get all SEO
router.get("/", getAllSeo);

// Get popular products
router.get("/popular", getPopularProducts);

// Get top rated products
router.get("/top-rated", getTopRatedProducts);

// Get SEO by slug
router.get("/slug/:slug", getSeoBySlug);

// Get SEO by product ID
router.get("/product/:productId", getSeoByProduct);

// Get SEO by productIdentifier
router.get("/identifier/:identifier", getSeoByProductIdentifier);

// Get SEO by salesPrice range
router.get("/sales-price/:value", getSeoBySalesPriceValue);

// Get SEO by purchasePrice range
router.get("/purchase-price/:value", getSeoByPurchasePriceValue);

// Get SEO by ID without populating product
router.get("/no-populate/:id", getSeoByIdNoPopulate);

// Get SEO by ID (with product populated)
router.get("/:id", getSeoById);

// Update SEO
router.put("/:id", updateSeo);

// Delete SEO
router.delete("/:id", deleteSeo);

module.exports = router;
