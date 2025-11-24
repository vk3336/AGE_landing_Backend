const express = require("express");
const router = express.Router();
const authorcontroller = require("../controller/authorcontroller");

router.post(
  "/",
  authorcontroller.upload.single("authorimage"),
  authorcontroller.createauthor
);
router.put(
  "/:id",
  authorcontroller.upload.single("authorimage"),
  authorcontroller.updateauthor
);
router.delete("/:id", authorcontroller.deleteauthor);
router.get("/", authorcontroller.getauthor);
router.get("/:id", authorcontroller.getauthorbyid);

module.exports = router;
