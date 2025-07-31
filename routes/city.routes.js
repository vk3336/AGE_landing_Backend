const express = require('express');
const cityController = require('../controller/city.controller');
const router = express.Router();

router.post('/', cityController.createCity);
router.get('/', cityController.getAllCities);
router.get('/:id', cityController.getCity);
router.put('/:id', cityController.updateCity);
router.delete('/:id', cityController.deleteCity);
router.get('/slug/:slug', cityController.findBySlug);

module.exports = router;
