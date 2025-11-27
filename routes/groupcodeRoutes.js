const express = require("express");
const router = express.Router();
const groupcodeController = require("../controller/groupcodeController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  ...(groupcodeController.validateCreate || []),
  groupcodeController.create
);
router.get("/", groupcodeController.viewAll);
router.get("/search/:q", groupcodeController.searchGroupcodes);
router.get("/:id", groupcodeController.viewById);
router.put(
  "/:id",
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  ...(groupcodeController.validateUpdate || []),
  groupcodeController.update
);
router.delete("/:id", groupcodeController.deleteById);
router.delete("/:id/image", groupcodeController.deleteImage);

module.exports = router;
