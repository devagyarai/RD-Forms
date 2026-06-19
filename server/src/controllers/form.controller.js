const Form = require("../models/Form.model");
const Response = require("../models/Response.model");
const { nanoid } = require("nanoid");

// ── GET /api/forms ───────────────────────────────────────────
async function getForms(req, res) {
  try {
    const forms = await Form.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ forms });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch forms." });
  }
}

// ── POST /api/forms ──────────────────────────────────────────
async function createForm(req, res) {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Form title is required." });
    }

    const form = await Form.create({
      userId: req.user._id,
      title: title.trim(),
      description: description?.trim() || "",
      fields: [],
    });

    res.status(201).json({ message: "Form created!", form });
  } catch (err) {
    console.error("Create form error:", err);
    res.status(500).json({ message: "Failed to create form." });
  }
}

// ── GET /api/forms/:id ───────────────────────────────────────
async function getForm(req, res) {
  try {
    const form = await Form.findOne({ _id: req.params.id, userId: req.user._id });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    res.json({ form });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch form." });
  }
}

// ── PUT /api/forms/:id ───────────────────────────────────────
// Carefully merges settings so shareId and acceptingResponses are never lost
async function updateForm(req, res) {
  try {
    const { title, description, fields, settings } = req.body;

    // First fetch existing to preserve shareId and defaults
    const existing = await Form.findOne({ _id: req.params.id, userId: req.user._id });

    if (!existing) {
      return res.status(404).json({ message: "Form not found." });
    }

    // Merge settings — only update keys that are explicitly provided
    const mergedSettings = {
      isPublished: settings?.isPublished !== undefined
        ? settings.isPublished
        : existing.settings.isPublished,
      acceptingResponses: settings?.acceptingResponses !== undefined
        ? settings.acceptingResponses
        : existing.settings.acceptingResponses,
    };

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      {
        title: title ?? existing.title,
        description: description ?? existing.description,
        fields: fields ?? existing.fields,
        settings: mergedSettings,
      },
      { new: true, runValidators: true }
    );

    res.json({ message: "Form saved!", form });
  } catch (err) {
    console.error("Update form error:", err);
    res.status(500).json({ message: "Failed to update form." });
  }
}

// ── DELETE /api/forms/:id ────────────────────────────────────
async function deleteForm(req, res) {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    // Also delete all responses for this form
    await Response.deleteMany({ formId: req.params.id });

    res.json({ message: "Form and all its responses deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete form." });
  }
}

// ── POST /api/forms/:id/duplicate ────────────────────────────
async function duplicateForm(req, res) {
  try {
    const original = await Form.findOne({ _id: req.params.id, userId: req.user._id });

    if (!original) {
      return res.status(404).json({ message: "Form not found." });
    }

    const copy = await Form.create({
      userId: req.user._id,
      title: `${original.title} (Copy)`,
      description: original.description,
      fields: original.fields,
      settings: { isPublished: false, acceptingResponses: true },
    });

    res.status(201).json({ message: "Form duplicated!", form: copy });
  } catch (err) {
    res.status(500).json({ message: "Failed to duplicate form." });
  }
}

// ── GET /api/forms/share/:shareId ────────────────────────────
// Public endpoint — no auth required
async function getPublicForm(req, res) {
  try {
    const form = await Form.findOne({ shareId: req.params.shareId });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    if (!form.settings.isPublished) {
      return res.status(403).json({ message: "This form is not published yet." });
    }

    if (!form.settings.acceptingResponses) {
      return res.status(403).json({ message: "This form is no longer accepting responses." });
    }

    // Increment view count
    await Form.findByIdAndUpdate(form._id, { $inc: { "analytics.views": 1 } });

    res.json({ form });
  } catch (err) {
    res.status(500).json({ message: "Failed to load form." });
  }
}

module.exports = {
  getForms,
  createForm,
  getForm,
  updateForm,
  deleteForm,
  duplicateForm,
  getPublicForm,
};
