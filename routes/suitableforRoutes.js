const express = require("express");
const router = express.Router();
const suitableforController = require("../controller/suitableforController");

router.post("/", suitableforController.validate, suitableforController.create);
router.get("/", suitableforController.viewAll);
router.get("/search/:q", suitableforController.searchSuitablefors);
router.get("/:id", suitableforController.viewById);
router.put(
  "/:id",
  suitableforController.validate,
  suitableforController.update
);
router.delete("/:id", suitableforController.deleteById);

module.exports = router;
