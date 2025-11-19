const express = require('express');
const router = express.Router();
const locationDetailController = require('../controller/locationDetailController');

router.post('/', locationDetailController.createLocationDetail);
router.get('/', locationDetailController.getAllLocationDetails);
router.get('/:id', locationDetailController.getLocationDetailById);
router.put('/:id', locationDetailController.updateLocationDetail);
router.delete('/:id', locationDetailController.deleteLocationDetail);

module.exports = router;
