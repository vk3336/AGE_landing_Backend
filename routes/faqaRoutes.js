const express = require("express");
const router = express.Router();
const faqaController = require("../controller/faqaController");

// Create FAQA
router.post("/", faqaController.createFAQA);

// View all FAQAs
router.get("/", faqaController.viewAllFAQA);

// View FAQA by ID
router.get("/:id", faqaController.viewFAQAById);

// Update FAQA
router.put("/:id", faqaController.updateFAQA);

// Delete FAQA
router.delete("/:id", faqaController.deleteFAQA);

module.exports = router;
