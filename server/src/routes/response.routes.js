const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  submitResponse,
  getResponses,
  exportResponses,
} = require("../controllers/response.controller");

// Public — anyone with the form ID can submit
router.post("/:formId", submitResponse);

// Protected — only form owner
router.get("/:formId", protect, getResponses);
router.get("/:formId/export", protect, exportResponses);

module.exports = router;
