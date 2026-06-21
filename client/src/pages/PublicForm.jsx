import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formsApi, responsesApi } from "../api";

// ── Star Rating Field ─────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hovered || value) ? "active" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Individual Field Renderer ─────────────────────────────────
function FormField({ field, value, onChange, error }) {
  const inputProps = {
    id: `field-${field.id}`,
    className: `form-input ${error ? "error" : ""}`,
    value: value || "",
    onChange: (e) => onChange(e.target.value),
    placeholder: field.placeholder || "",
    required: field.required,
  };

  const renderInput = () => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...inputProps}
            className={`form-textarea ${error ? "error" : ""}`}
            rows={4}
          />
        );

      case "email":
        return <input {...inputProps} type="email" />;

      case "number":
        return <input {...inputProps} type="number" />;

      case "date":
        return <input {...inputProps} type="date" />;

      case "dropdown":
        return (
          <select
            id={inputProps.id}
            className={`form-select ${error ? "error" : ""}`}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="option-group">
            {field.options?.map((opt, i) => (
              <label key={i} className="option-item">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const checkedValues = Array.isArray(value) ? value : [];
        return (
          <div className="option-group">
            {field.options?.map((opt, i) => (
              <label key={i} className="option-item">
                <input
                  type="checkbox"
                  value={opt}
                  checked={checkedValues.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...checkedValues, opt]);
                    } else {
                      onChange(checkedValues.filter((v) => v !== opt));
                    }
                  }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "rating":
        return (
          <StarRating
            value={value || 0}
            onChange={onChange}
          />
        );

      default:
        return <input {...inputProps} type="text" />;
    }
  };

  return (
    <div className="public-field">
      <label className="public-field-label" htmlFor={`field-${field.id}`}>
        {field.label}
        {field.required && <span className="required-star">*</span>}
      </label>
      {renderInput()}
      {error && <div className="form-error">⚠ {error}</div>}
    </div>
  );
}

// ── Thank You Screen ──────────────────────────────────────────
function ThankYou() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "4rem" }}>🎉</div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Thank you!</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: "320px" }}>
        Your response has been submitted successfully. We appreciate your time.
      </p>
      <div
        style={{
          marginTop: "8px",
          padding: "12px 20px",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "var(--radius-sm)",
          color: "var(--color-success)",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        ✓ Response recorded
      </div>
    </div>
  );
}

// ── Main Public Form Page ─────────────────────────────────────
export default function PublicForm({ showToast }) {
  const { shareId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    formsApi
      .getPublic(shareId)
      .then((data) => setForm(data.form))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [shareId]);

  const updateAnswer = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const validate = () => {
    const errors = {};
    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.id];
        const isEmpty =
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0);
        if (isEmpty) {
          errors[field.id] = `"${field.label}" is required.`;
        }
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstId = Object.keys(errors)[0];
      document.getElementById(`field-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      await responsesApi.submit(form._id, { answers });
      setSubmitted(true);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-form-page">
        <div className="loading-page">
          <div className="spinner spinner-lg" style={{ color: "var(--color-primary)" }} />
          <span>Loading form...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-form-page">
        <div className="empty-state">
          <div className="empty-state-icon">🚫</div>
          <h3>Form unavailable</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-page">
      {/* Powered by tag */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "1rem" }}>📋</span>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
          RD Forms
        </span>
      </div>

      <div className="public-form-container">
        {/* Progress Bar */}
        {!submitted && form.fields?.some(f => f.required) && (
          <div className="form-progress-container" style={{ marginBottom: "20px", borderRadius: "var(--radius-card)" }}>
            <div className="form-progress-track">
              <div 
                className="form-progress-fill" 
                style={{ 
                  width: `${Math.round((form.fields.filter(f => f.required && answers[f.id] !== undefined && answers[f.id] !== null && answers[f.id] !== "" && (!Array.isArray(answers[f.id]) || answers[f.id].length > 0)).length / form.fields.filter(f => f.required).length) * 100)}%` 
                }} 
              />
            </div>
            <div className="form-progress-text">
              {form.fields.filter(f => f.required && answers[f.id] !== undefined && answers[f.id] !== null && answers[f.id] !== "" && (!Array.isArray(answers[f.id]) || answers[f.id].length > 0)).length} / {form.fields.filter(f => f.required).length} required
            </div>
          </div>
        )}

        <div className="public-form-card">
          <div className="public-form-banner" />

          {submitted ? (
            <ThankYou />
          ) : (
            <form className="public-form-body" onSubmit={handleSubmit} noValidate>
              {/* Form header */}
              <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>
                  {form.title}
                </h1>
                {form.description && (
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {form.description}
                  </p>
                )}
              </div>

              {/* Fields */}
              {form.fields?.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 0" }}>
                  <div className="empty-state-icon">📝</div>
                  <p>This form has no fields yet.</p>
                </div>
              ) : (
                form.fields.map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    value={answers[field.id]}
                    onChange={(val) => updateAnswer(field.id, val)}
                    error={fieldErrors[field.id]}
                  />
                ))
              )}

              {/* Submit */}
              {form.fields?.length > 0 && (
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={submitting}
                  id="submit-response-btn"
                  style={{ marginTop: "8px" }}
                >
                  {submitting ? (
                    <><div className="spinner" /> Submitting...</>
                  ) : (
                    "Submit Response"
                  )}
                </button>
              )}
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Powered by RD Forms · Built with ❤
        </p>
      </div>
    </div>
  );
}
