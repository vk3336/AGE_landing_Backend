const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");

// Create product
router.post(
  "/",
  productController.multiUpload,
  productController.handleColorArray,
  productController.validate,
  productController.create
);

// View all products
router.get("/", productController.viewAll);

// View product by ID
router.get("/:id", productController.viewById);

// Update product
router.put(
  "/:id",
  productController.multiUpload,
  productController.handleColorArray,
  productController.validate,
  productController.update
);

// Delete product
router.delete("/:id", productController.deleteById);

// SEARCH PRODUCTS BY NAME
router.get("/search/:q", productController.searchProducts);

// GET ALL PRODUCTS BY GROUPCODE ID
router.get("/groupcode/:groupcodeId", productController.getProductsByGroupcode);

// GET PRODUCTS BY CATEGORY ID
router.get("/category/:categoryId", productController.getProductsByCategory);

// GET PRODUCTS BY CONTENT ID
router.get("/content/:contentId", productController.getProductsByContent);

// GET PRODUCTS BY DESIGN ID
router.get("/design/:designId", productController.getProductsByDesign);

// GET PRODUCTS BY COLOR ID
router.get("/color/:colorId", productController.getProductsByColor);

// GET PRODUCTS BY MOTIF ID
router.get("/motif/:motifId", productController.getProductsByMotif);

// GET PRODUCTS BY VENDOR ID
router.get("/vendor/:vendorId", productController.getProductsByVendor);

// GET PRODUCTS BY GSM RANGE
router.get("/gsm/:value", productController.getProductsByGsmValue);

// GET PRODUCTS BY OZ RANGE
router.get("/oz/:value", productController.getProductsByOzValue);

// GET PRODUCTS BY INCH RANGE
router.get("/inch/:value", productController.getProductsByInchValue);

// GET PRODUCTS BY CM RANGE
router.get("/cm/:value", productController.getProductsByCmValue);

// GET PRODUCTS BY QUANTITY RANGE
router.get(
  "/quantity/:value",
  require("../controller/productController").getProductsByQuantityValue
);

// GET PRODUCT BY SLUG
router.get("/slug/:slug", productController.getProductBySlug);

// DELETE PRODUCT IMAGE
router.delete("/image/:id/:imageName", productController.deleteProductImage);

module.exports = router;
