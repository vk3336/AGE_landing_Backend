const express = require("express");
const router = express.Router();
const colorController = require("../controller/colorController");

router.post("/", colorController.validate, colorController.create);
router.get("/", colorController.viewAll);
router.get("/search/:q", colorController.searchColors);
router.get("/:id", colorController.viewById);
router.put("/:id", colorController.validate, colorController.update);
router.delete("/:id", colorController.deleteById);

module.exports = router;
