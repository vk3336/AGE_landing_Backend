const express = require("express");
const router = express.Router();
const stateDetailController = require("../controller/stateDetailController");

router.post("/", stateDetailController.createState);
router.get("/", stateDetailController.getStates);
router.get("/:id", stateDetailController.getStateById);
router.put("/:id", stateDetailController.updateState);
router.delete("/:id", stateDetailController.deleteState);

module.exports = router;
