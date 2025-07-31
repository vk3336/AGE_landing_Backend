const express = require('express');
const areaController = require('../controller/area.controller');
const router = express.Router();

router.post('/', areaController.createArea);
router.get('/', areaController.getAllAreas);
router.get('/:id', areaController.getArea);
router.put('/:id', areaController.updateArea);
router.delete('/:id', areaController.deleteArea);
router.get('/slug/:slug', areaController.findBySlug);

module.exports = router;
