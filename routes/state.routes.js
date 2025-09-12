const express = require("express");
const stateController = require("../controller/state.controller");
const router = express.Router();

// Public routes
router.post("/", stateController.createState);
router.get("/", stateController.getAllStates);
router.get("/search/:q", stateController.searchStates);
router.get("/:id", stateController.getState);
router.put("/:id", stateController.updateState);
router.delete("/:id", stateController.deleteState);
router.get("/slug/:slug", stateController.findBySlug);

module.exports = router;
