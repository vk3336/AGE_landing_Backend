const express = require("express");
const router = express.Router();
const designController = require("../controller/designController");

router.post("/", designController.validate, designController.create);
router.get("/", designController.viewAll);
router.get("/search/:q", designController.searchDesigns);
router.get("/:id", designController.viewById);
router.put("/:id", designController.validate, designController.update);
router.delete("/:id", designController.deleteById);

module.exports = router;
