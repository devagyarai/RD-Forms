const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    // answers is a flexible map: { fieldId: value }
    // We use Map to handle dynamic field IDs
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Optional: capture submitter info for analytics
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
