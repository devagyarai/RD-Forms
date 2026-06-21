import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "../components/shared/Sidebar";
import { formsApi } from "../api";

// ── Helpers ───────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getShareUrl(shareId) {
  return `${window.location.origin}/form/${shareId}`;
}

// ── Field type definitions ────────────────────────────────────
const FIELD_CATEGORIES = [
  {
    name: "Basic Fields",
    fields: [
      { type: "text",     icon: "Aa",  label: "Text Input",   color: "#14B8A6" },
      { type: "email",    icon: "✉",   label: "Email",        color: "#3B82F6" },
      { type: "phone",    icon: "📞",  label: "Phone",        color: "#10B981" },
      { type: "number",   icon: "#",   label: "Number",       color: "#A855F7" },
      { type: "textarea", icon: "¶",   label: "Text Area",    color: "#14B8A6" },
      { type: "date",     icon: "📅",  label: "Date",         color: "#A855F7" },
      { type: "time",     icon: "⏰",  label: "Time",         color: "#F43F5E" },
    ]
  },
  {
    name: "Selection",
    fields: [
      { type: "radio",    icon: "◉",   label: "Radio Button", color: "#EF4444" },
      { type: "checkbox", icon: "☑",   label: "Checkbox",     color: "#22C55E" },
      { type: "dropdown", icon: "▾",   label: "Dropdown",     color: "#F59E0B" },
    ]
  },
  {
    name: "Advanced",
    fields: [
      { type: "file",     icon: "📎",  label: "File Upload",  color: "#6366F1" },
      { type: "rating",   icon: "★",   label: "Rating",       color: "#F59E0B" },
      { type: "slider",   icon: "⎚",   label: "Slider",       color: "#8B5CF6" },
      { type: "signature",icon: "✍",   label: "Signature",    color: "#06B6D4" },
      { type: "url",      icon: "🔗",  label: "URL",          color: "#0EA5E9" },
      { type: "password", icon: "🔒",  label: "Password",     color: "#64748B" },
    ]
  },
  {
    name: "Layout",
    fields: [
      { type: "section",  icon: "⛶",   label: "Section",      color: "#64748B" },
      { type: "divider",  icon: "―",   label: "Divider",      color: "#94A3B8" },
      { type: "heading",  icon: "H1",  label: "Heading",      color: "#475569" },
      { type: "paragraph",icon: "≣",   label: "Paragraph",    color: "#475569" },
      { type: "image",    icon: "🖼",  label: "Image",        color: "#EC4899" },
    ]
  }
];

const ALL_FIELDS = FIELD_CATEGORIES.flatMap(c => c.fields);

function createField(type) {
  const def = ALL_FIELDS.find((f) => f.type === type);
  return {
    id: generateId(),
    type,
    label: def?.label || "Field",
    placeholder: "",
    helpText: "",
    required: false,
    width: "100%",
    conditional: false,
    options: ["dropdown", "radio", "checkbox"].includes(type)
      ? ["Option 1", "Option 2"]
      : [],
  };
}

// ── Sortable Field Item ───────────────────────────────────────
function SortableField({ field, isSelected, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const def = FIELD_TYPES.find((f) => f.type === field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`field-item ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div className="field-item-drag" {...attributes} {...listeners} title="Drag to reorder">
        ⠿
      </div>

      <div className="field-item-body">
        <div className="field-item-label">
          <span
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: 4, fontSize: "0.7rem",
              fontWeight: 700, background: `${def?.color}22`, color: def?.color,
              marginRight: 6, flexShrink: 0,
            }}
          >
            {def?.icon}
          </span>
          {field.label}
          {field.required && <span className="field-required-dot"> *</span>}
        </div>
        <div className="field-item-type">{field.type}</div>
      </div>

      <div className="field-item-actions">
        <button
          className="btn btn-ghost btn-icon"
          style={{ width: 28, height: 28, color: "var(--color-danger)", fontSize: "0.75rem" }}
          onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
          title="Delete field"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Properties Panel ──────────────────────────────────────────
function PropertiesPanel({ field, onChange }) {
  if (!field) {
    return (
      <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.3 }}>⚙</div>
        <p style={{ fontSize: "0.82rem" }}>Select a field to edit its properties</p>
      </div>
    );
  }

  const hasOptions = ["dropdown", "radio", "checkbox"].includes(field.type);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="form-group">
        <label className="form-label">Label</label>
        <input
          className="form-input"
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="Field label"
        />
      </div>

      {!["checkbox", "radio", "rating"].includes(field.type) && (
        <div className="form-group">
          <label className="form-label">Placeholder</label>
          <input
            className="form-input"
            value={field.placeholder}
            onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
            placeholder="Placeholder text"
          />
        </div>
      )}

      {hasOptions && (
        <div className="form-group">
          <label className="form-label">Options</label>
          {field.options?.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
              <input
                className="form-input"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...field.options];
                  newOpts[i] = e.target.value;
                  onChange({ ...field, options: newOpts });
                }}
                placeholder={`Option ${i + 1}`}
              />
              <button
                className="btn btn-ghost btn-icon"
                style={{ color: "var(--color-danger)", flexShrink: 0 }}
                onClick={() => {
                  const newOpts = field.options.filter((_, j) => j !== i);
                  onChange({ ...field, options: newOpts });
                }}
                disabled={field.options.length <= 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", border: "1px dashed var(--border-default)", marginTop: "4px" }}
            onClick={() => onChange({ ...field, options: [...field.options, `Option ${field.options.length + 1}`] })}
          >
            + Add Option
          </button>
        </div>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => onChange({ ...field, required: e.target.checked })}
          style={{ accentColor: "var(--color-primary)", width: "16px", height: "16px" }}
        />
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)" }}>
          Required field
        </span>
        {field.required && (
          <span style={{ marginLeft: "auto", color: "var(--color-danger)", fontSize: "0.8rem" }}>*</span>
        )}
      </label>

      <div className="form-group">
        <label className="form-label">Help Text / Description</label>
        <textarea
          className="form-input"
          value={field.helpText || ""}
          onChange={(e) => onChange({ ...field, helpText: e.target.value })}
          placeholder="Subtext below the field..."
          rows="2"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Custom Width</label>
        <select
          className="form-input"
          value={field.width || "100%"}
          onChange={(e) => onChange({ ...field, width: e.target.value })}
        >
          <option value="100%">Full Width (100%)</option>
          <option value="50%">Half Width (50%)</option>
          <option value="33%">One Third (33%)</option>
        </select>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
        <input
          type="checkbox"
          checked={field.conditional || false}
          onChange={(e) => onChange({ ...field, conditional: e.target.checked })}
          style={{ accentColor: "var(--color-primary)", width: "16px", height: "16px" }}
        />
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)" }}>
          Enable Conditional Logic
        </span>
      </label>
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────────
function ShareModal({ shareId, formTitle, onClose }) {
  const shareUrl = getShareUrl(shareId);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {
      // Fallback
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openLink = () => window.open(shareUrl, "_blank");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Share Form</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {formTitle}
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Live badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", padding: "10px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-sm)" }}>
          <span style={{ color: "var(--color-success)", fontSize: "0.75rem" }}>●</span>
          <span style={{ fontSize: "0.82rem", color: "var(--color-success)", fontWeight: 600 }}>
            Form is live and accepting responses
          </span>
        </div>

        {/* Link box */}
        <div style={{ marginBottom: "20px" }}>
          <p className="form-label" style={{ marginBottom: "8px" }}>Shareable Link</p>
          <div className="share-link-box">
            <span className="share-link-url">{shareUrl}</span>
            <button className="btn btn-sm btn-ghost" onClick={openLink} title="Open in new tab" style={{ flexShrink: 0 }}>
              ↗
            </button>
            <button
              className={`btn btn-sm ${copied ? "btn-secondary" : "btn-primary"}`}
              onClick={copyLink}
              id="copy-link-btn"
              style={{ flexShrink: 0 }}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--border-subtle)", margin: "16px 0" }} />

        {/* QR Code */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <p className="form-label">QR Code</p>
          <div
            style={{
              padding: "20px",
              background: "white",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
              display: "inline-flex",
            }}
          >
            <QRCodeSVG
              value={shareUrl}
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
            Scan with any phone camera to open the form
          </p>
        </div>
      </div>
    </div>
  );
}

// ── New Form Modal ────────────────────────────────────────────
function NewFormModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate(title.trim(), description.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <h3 className="modal-title">New Form</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Form Title *</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Feedback"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this form about?"
              rows={3}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" disabled={loading || !title.trim()} id="create-form-btn">
              {loading ? <><div className="spinner" />Creating...</> : "Create & Edit →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Form Builder Page ────────────────────────────────────
export default function FormBuilder({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [mobileTab, setMobileTab] = useState("canvas"); // 'add', 'canvas', 'properties'
  const [fieldSearch, setFieldSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({
    "Basic Fields": true,
    "Selection": true,
    "Advanced": true,
    "Layout": true
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    formsApi.getById(id)
      .then((data) => {
        setForm(data.form);
        setTitle(data.form.title);
        setDescription(data.form.description || "");
        setFields(data.form.fields || []);
      })
      .catch(() => {
        showToast("Failed to load form.", "error");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Track unsaved changes
  useEffect(() => { setHasUnsaved(true); }, [fields, title, description]);
  useEffect(() => { setHasUnsaved(false); }, [form]);

  // Auto-save logic
  useEffect(() => {
    if (!hasUnsaved || loading || saving) return;
    const timer = setTimeout(() => {
      handleSave(null, true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasUnsaved, loading, saving, title, description, fields]);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const addField = (type) => {
    const newField = createField(type);
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setHasUnsaved(true);
    setMobileTab("canvas");
  };

  const handleFieldClick = (id) => {
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    } else {
      setSelectedFieldId(id);
      setMobileTab("properties");
    }
  };

  const updateSelectedField = (updated) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setHasUnsaved(true);
  };

  const deleteField = (fieldId) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    setHasUnsaved(true);
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setHasUnsaved(true);
    }
  };

  const handleSave = async (publishOverride = null, isAutoSave = false) => {
    setSaving(true);
    try {
      const settings = {};
      if (publishOverride !== null) settings.isPublished = publishOverride;

      const updated = await formsApi.update(id, {
        title,
        description,
        fields,
        settings,
      });

      setForm(updated.form);
      setHasUnsaved(false);

      if (publishOverride === true) {
        showToast("Form published! 🎉 Share it now.", "success");
        setTimeout(() => setShowShare(true), 400);
      } else if (publishOverride === false) {
        showToast("Form unpublished.", "success");
      } else if (!isAutoSave) {
        showToast("Saved ✓", "success");
      }
    } catch (err) {
      if (!isAutoSave) showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="builder-shell">
        <Sidebar />
        <main style={{ flex: 1 }}>
          <div className="loading-page">
            <div className="spinner spinner-lg" style={{ color: "var(--color-primary)" }} />
            Loading form...
          </div>
        </main>
      </div>
    );
  }

  const isPublished = form?.settings?.isPublished;

  return (
    <div className="builder-shell">
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Top bar */}
        <div className="builder-topbar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>

          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              className="builder-topbar-title form-input"
              style={{ background: "transparent", border: "1px solid transparent", fontSize: "0.95rem", fontWeight: 700, flex: 1 }}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setHasUnsaved(true); }}
              placeholder="Untitled Form"
            />
            
            <div style={{ display: "flex", alignItems: "center", minWidth: "70px", gap: "6px" }}>
              {saving ? (
                <>
                  <div className="spinner" style={{ width: "12px", height: "12px", color: "var(--color-primary)" }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 500 }}>Saving...</span>
                </>
              ) : hasUnsaved ? (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>Unsaved</span>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "var(--color-success)" }}>✓</span> Saved
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className={`badge ${isPublished ? "badge-success" : "badge-muted"}`}>
              {isPublished ? "● Live" : "○ Draft"}
            </span>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => window.open(`/form/${id}`, '_blank')}
            >
              👁 Preview
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowShare(true)}
              disabled={!isPublished || !form?.shareId}
              title={!isPublished ? "Publish to share" : "Share form"}
              id="share-btn"
            >
              📤 Share
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave(null, false)}
              disabled={saving || !hasUnsaved}
              id="save-btn"
            >
              Save
            </button>

            <button
              className={`btn btn-sm ${isPublished ? "btn-danger" : "btn-primary"}`}
              onClick={() => handleSave(!isPublished)}
              disabled={saving}
              id="publish-btn"
            >
              {isPublished ? "Unpublish" : "✦ Publish"}
            </button>
          </div>
        </div>

        {/* Builder body */}
        <div className="builder-body">

          {/* Left panel — field palette */}
          <div className={`builder-sidebar ${mobileTab !== 'add' ? 'mobile-hidden' : ''}`}>
            <p className="sidebar-section-label" style={{ marginBottom: "10px" }}>Add Fields</p>
            
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search fields..." 
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              style={{ marginBottom: '16px' }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FIELD_CATEGORIES.map((category) => {
                const filteredFields = category.fields.filter(f => 
                  f.label.toLowerCase().includes(fieldSearch.toLowerCase())
                );
                
                if (filteredFields.length === 0) return null;

                return (
                  <div key={category.name} className="field-category">
                    <div 
                      className="field-category-header" 
                      onClick={() => setExpandedCategories(prev => ({...prev, [category.name]: !prev[category.name]}))}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}
                    >
                      {category.name}
                      <span>{expandedCategories[category.name] ? '▼' : '▶'}</span>
                    </div>
                    
                    {expandedCategories[category.name] && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: '8px' }}>
                        {filteredFields.map((ft) => (
                          <button
                            key={ft.type}
                            className="field-type-btn"
                            onClick={() => addField(ft.type)}
                            id={`add-field-${ft.type}`}
                          >
                            <div
                              className="field-type-icon"
                              style={{ background: `${ft.color}22`, color: ft.color }}
                            >
                              {ft.icon}
                            </div>
                            {ft.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Field count */}
            {fields.length > 0 && (
              <div style={{ marginTop: "16px", padding: "10px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--color-primary-light)" }}>{fields.length}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                  Field{fields.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>

          {/* Center — form canvas */}
          <div className={`builder-canvas ${mobileTab !== 'canvas' ? 'mobile-hidden' : ''}`}>
            {/* Form header card */}
            <div className="canvas-form-header">
              <input
                className="canvas-form-title-input"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setHasUnsaved(true); }}
                placeholder="Form Title"
              />
              <textarea
                className="canvas-form-desc-input"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setHasUnsaved(true); }}
                placeholder="Form description (optional)"
                rows={2}
              />
            </div>

            {/* Fields or empty state */}
            {fields.length === 0 ? (
              <div className="canvas-empty animate-fade-in" style={{ 
                border: '2px dashed var(--border-default)', 
                borderRadius: 'var(--radius-card)',
                padding: '60px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-base)',
                color: 'var(--text-muted)'
              }}>
                <div style={{ 
                  width: '64px', height: '64px', 
                  borderRadius: '50%', background: 'var(--bg-elevated)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', marginBottom: '24px',
                  boxShadow: 'var(--shadow-sm)'
                }}>✨</div>
                <h3 style={{ color: "var(--text-heading)", fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Your canvas is empty</h3>
                <p style={{ fontSize: "0.9rem", maxWidth: '300px', textAlign: 'center', lineHeight: 1.5 }}>
                  Drag and drop fields from the left panel, or click to add them instantly.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                  {FIELD_CATEGORIES[0].fields.slice(0, 3).map(f => (
                    <button 
                      key={f.type}
                      className="btn btn-secondary btn-sm"
                      onClick={() => addField(f.type)}
                      style={{ fontSize: '0.8rem' }}
                    >
                      + {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      isSelected={field.id === selectedFieldId}
                      onClick={() => handleFieldClick(field.id)}
                      onDelete={deleteField}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="field-item" style={{ opacity: 0.9, boxShadow: "var(--shadow-lg)" }}>
                      <div className="field-item-body">
                        <div className="field-item-label">
                          {fields.find((f) => f.id === activeId)?.label}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Preview notice */}
            {fields.length > 0 && (
              <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {isPublished ? (
                  <span>
                    Form is live ·{" "}
                    <button
                      onClick={() => setShowShare(true)}
                      style={{ background: "none", border: "none", color: "var(--color-primary-light)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: 600 }}
                    >
                      View share link →
                    </button>
                  </span>
                ) : (
                  <span>
                    Publish this form to share it with others
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right panel — properties */}
          <div className={`builder-properties ${mobileTab !== 'properties' ? 'mobile-hidden' : ''}`}>
            <p className="sidebar-section-label" style={{ marginBottom: "16px" }}>Field Properties</p>
            <PropertiesPanel
              field={selectedField}
              onChange={updateSelectedField}
            />
          </div>
        </div>
        
        {/* Mobile Tab Bar */}
        <div className="mobile-tab-bar mobile-only">
          <button 
            className={`mobile-tab-btn ${mobileTab === 'add' ? 'active' : ''}`}
            onClick={() => setMobileTab('add')}
          >
            <span className="mobile-tab-icon">➕</span>
            Add
          </button>
          <button 
            className={`mobile-tab-btn ${mobileTab === 'canvas' ? 'active' : ''}`}
            onClick={() => setMobileTab('canvas')}
          >
            <span className="mobile-tab-icon">📋</span>
            Canvas
          </button>
          <button 
            className={`mobile-tab-btn ${mobileTab === 'properties' ? 'active' : ''}`}
            onClick={() => setMobileTab('properties')}
          >
            <span className="mobile-tab-icon">⚙️</span>
            Properties
          </button>
        </div>

      </div>

      {/* Share modal — uses shareId from form state directly */}
      {showShare && form?.shareId && (
        <ShareModal
          shareId={form.shareId}
          formTitle={form.title}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
