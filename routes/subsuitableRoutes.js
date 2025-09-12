const express = require("express");
const router = express.Router();
const subsuitableController = require("../controller/subsuitableController");

router.post("/", subsuitableController.validate, subsuitableController.create);
router.get("/", subsuitableController.viewAll);
router.get("/search/:q", subsuitableController.searchSubsuitables);
router.get("/:id", subsuitableController.viewById);
router.put(
  "/:id",
  subsuitableController.validate,
  subsuitableController.update
);
router.delete("/:id", subsuitableController.deleteById);

module.exports = router;
