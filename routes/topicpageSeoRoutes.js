const express = require('express');
const router = express.Router();
const staticSeoController = require('../controller/topicpageController');

// Public routes
router.get('/', staticSeoController.getAllStaticSEO);
router.get('/:id', staticSeoController.getStaticSEOById);
router.get('/slug/:slug', staticSeoController.getStaticSEOBySlug);

// Write operations
router.post('/', staticSeoController.createStaticSEO);
router.put('/:id', staticSeoController.updateStaticSEO);
router.delete('/:id', staticSeoController.deleteStaticSEO);

module.exports = router;
