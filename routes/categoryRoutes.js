const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");

// Create category
router.post(
  "/",
  categoryController.upload.single("image"),
  categoryController.validate,
  categoryController.createCategory
);

// View all categories
router.get("/", categoryController.viewAllCategories);

// View category by ID
router.get("/:id", categoryController.viewCategoryById);

// Update category
router.put(
  "/:id",
  categoryController.upload.single("image"),
  categoryController.validate,
  categoryController.updateCategory
);

// Delete category
router.delete("/:id", categoryController.deleteCategoryById);

// Delete category image
router.delete("/:id/image", categoryController.deleteCategoryImage);

module.exports = router;
