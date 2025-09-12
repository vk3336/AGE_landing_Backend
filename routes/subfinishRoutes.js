const express = require("express");
const router = express.Router();
const subfinishController = require("../controller/subfinishController");

router.post("/", subfinishController.validate, subfinishController.create);
router.get("/", subfinishController.viewAll);
router.get("/search/:q", subfinishController.searchSubfinishes);
router.get("/:id", subfinishController.viewById);
router.put("/:id", subfinishController.validate, subfinishController.update);
router.delete("/:id", subfinishController.deleteById);

module.exports = router;
