const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

// Defines the shape of each field inside a form
const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => nanoid(8) },
    type: {
      type: String,
      required: true,
    },
    label: { type: String, required: true, trim: true },
    placeholder: { type: String, default: "" },
    required: { type: Boolean, default: false },
    helpText: { type: String, default: "" },
    width: { type: String, default: "100%" },
    conditional: { type: Boolean, default: false },
    // Used for dropdown, radio, checkbox
    options: [{ type: String }],
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Form title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    fields: [fieldSchema],
    settings: {
      isPublished: { type: Boolean, default: false },
      acceptingResponses: { type: Boolean, default: true },
    },
    // Unique 10-char ID used in the public share link
    shareId: {
      type: String,
      unique: true,
      default: () => nanoid(10),
    },
    analytics: {
      views: { type: Number, default: 0 },
      submissions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
