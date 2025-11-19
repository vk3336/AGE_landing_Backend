const express = require('express');
const router = express.Router();
const cityDetailController = require('../controller/cityDetailController');

router.post('/', cityDetailController.createCity);
router.get('/', cityDetailController.getCities);
router.get('/:id', cityDetailController.getCityById);
router.put('/:id', cityDetailController.updateCity);
router.delete('/:id', cityDetailController.deleteCity);

module.exports = router;
