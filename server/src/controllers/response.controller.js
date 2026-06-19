const Response = require("../models/Response.model");
const Form = require("../models/Form.model");

// ── POST /api/responses/:formId ──────────────────────────────
// Public — no auth required
async function submitResponse(req, res) {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    if (!form.settings.isPublished || !form.settings.acceptingResponses) {
      return res.status(403).json({ message: "This form is not accepting responses." });
    }

    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Answers are required." });
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required) {
        const value = answers[field.id];
        const isEmpty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          return res.status(400).json({
            message: `"${field.label}" is required.`,
          });
        }
      }
    }

    const response = await Response.create({
      formId: form._id,
      answers,
    });

    // Increment submission count
    await Form.findByIdAndUpdate(form._id, {
      $inc: { "analytics.submissions": 1 },
    });

    res.status(201).json({ message: "Response submitted successfully!", response });
  } catch (err) {
    console.error("Submit response error:", err);
    res.status(500).json({ message: "Failed to submit response." });
  }
}

// ── GET /api/responses/:formId ───────────────────────────────
// Protected — only form owner can view
async function getResponses(req, res) {
  try {
    // Verify the form belongs to the current user
    const form = await Form.findOne({ _id: req.params.formId, userId: req.user._id });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    const responses = await Response.find({ formId: req.params.formId }).sort({
      submittedAt: -1,
    });

    res.json({ responses, form });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch responses." });
  }
}

// ── GET /api/responses/:formId/export ───────────────────────
// Protected — returns JSON data for CSV conversion on client
async function exportResponses(req, res) {
  try {
    const form = await Form.findOne({ _id: req.params.formId, userId: req.user._id });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    const responses = await Response.find({ formId: req.params.formId }).sort({
      submittedAt: -1,
    });

    // Build flat rows: one object per response with field labels as keys
    const rows = responses.map((r) => {
      const row = { "Submitted At": new Date(r.submittedAt).toLocaleString() };

      for (const field of form.fields) {
        const value = r.answers.get ? r.answers.get(field.id) : r.answers[field.id];
        row[field.label] = Array.isArray(value) ? value.join(", ") : value ?? "";
      }

      return row;
    });

    res.json({ rows, formTitle: form.title });
  } catch (err) {
    res.status(500).json({ message: "Failed to export responses." });
  }
}

module.exports = { submitResponse, getResponses, exportResponses };
