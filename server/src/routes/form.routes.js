const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getForms,
  createForm,
  getForm,
  updateForm,
  deleteForm,
  duplicateForm,
  getPublicForm,
} = require("../controllers/form.controller");

// Public route — must be defined before /:id to avoid conflict
router.get("/share/:shareId", getPublicForm);

// Protected routes
router.get("/", protect, getForms);
router.post("/", protect, createForm);
router.get("/:id", protect, getForm);
router.put("/:id", protect, updateForm);
router.delete("/:id", protect, deleteForm);
router.post("/:id/duplicate", protect, duplicateForm);

module.exports = router;
