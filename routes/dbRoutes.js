const express = require('express');
const router = express.Router();
const { compareDatabases, getAllCollectionsData } = require('../controller/dbController');

// @route   GET /api/db/compare
// @desc    Compare development and production databases
// @access  Private (you might want to add authentication middleware)
router.get('/compare', compareDatabases);

// @route   GET /api/db/all-collections
// @desc    Get all records from all collections in the database
// @access  Private (recommended to add authentication middleware)
router.get('/landingpage', getAllCollectionsData);

module.exports = router;
