const express = require("express");
const router = express.Router();
const structureController = require("../controller/structureController");

router.post("/", structureController.validate, structureController.create);
router.get("/", structureController.viewAll);
router.get("/search/:q", structureController.searchStructures);
router.get("/:id", structureController.viewById);
router.put("/:id", structureController.validate, structureController.update);
router.delete("/:id", structureController.deleteById);

module.exports = router;
