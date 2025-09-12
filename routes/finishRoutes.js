const express = require("express");
const router = express.Router();
const finishController = require("../controller/finishController");

router.post("/", finishController.validate, finishController.create);
router.get("/", finishController.viewAll);
router.get("/search/:q", finishController.searchFinishes);
router.get("/:id", finishController.viewById);
router.put("/:id", finishController.validate, finishController.update);
router.delete("/:id", finishController.deleteById);

module.exports = router;
