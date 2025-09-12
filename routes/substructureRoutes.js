const express = require("express");
const router = express.Router();
const substructureController = require("../controller/substructureController");

router.post(
  "/",
  substructureController.validate,
  substructureController.create
);
router.get("/", substructureController.viewAll);
router.get("/search/:q", substructureController.searchSubstructures);
router.get("/:id", substructureController.viewById);
router.put(
  "/:id",
  substructureController.validate,
  substructureController.update
);
router.delete("/:id", substructureController.deleteById);

module.exports = router;
