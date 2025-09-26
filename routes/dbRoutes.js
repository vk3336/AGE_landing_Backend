const express = require('express');
const router = express.Router();
const { compareDatabases } = require('../controller/dbController');

// @route   GET /api/db/compare
// @desc    Compare development and production databases
// @access  Private (you might want to add authentication middleware)
router.get('/compare', compareDatabases);

module.exports = router;
