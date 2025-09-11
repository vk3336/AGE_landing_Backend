const express = require('express');
const aboutUsController = require('../controller/aboutUsController');
const router = express.Router();

// Get about us content
router.get('/', aboutUsController.getAboutUs);

// Create new about us content
router.post('/', aboutUsController.createAboutUs);

// Update about us content
router.put('/:id', aboutUsController.updateAboutUs);

// Delete about us content
router.delete('/:id', aboutUsController.deleteAboutUs);

module.exports = router;
