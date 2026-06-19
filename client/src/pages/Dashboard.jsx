import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import { formsApi } from "../api";
import { formatDate, truncate } from "../utils/helpers";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, iconColor, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

// ── Form Card ─────────────────────────────────────────────────
function FormCard({ form, onOpen, onDelete, onDuplicate, onResponses }) {
  const fieldCount   = form.fields?.length || 0;
  const submissions  = form.analytics?.submissions || 0;
  const views        = form.analytics?.views || 0;
  const isPublished  = form.settings?.isPublished;

  return (
    <div
      className="form-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="form-card-accent" />

      <div className="form-card-body">
        {/* Header row */}
        <div className="form-card-header">
          <div className="form-card-icon-wrap">📋</div>
          <div className="form-card-menu">
            <button
              className="btn btn-ghost btn-icon btn-sm"
              title="View responses"
              onClick={(e) => { e.stopPropagation(); onResponses(); }}
            >
              📊
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              title="Duplicate"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            >
              ⧉
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ color: "var(--color-danger)" }}
            >
              🗑
            </button>
          </div>
        </div>

        {/* Title + desc */}
        <div>
          <div className="form-card-title">{form.title}</div>
          {form.description && (
            <div className="form-card-desc" style={{ marginTop: "4px" }}>
              {truncate(form.description, 75)}
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="form-card-chips">
          <span className="chip chip-muted">{fieldCount} field{fieldCount !== 1 ? "s" : ""}</span>
          {views > 0 && (
            <span className="chip chip-blue">{views} view{views !== 1 ? "s" : ""}</span>
          )}
          {submissions > 0 && (
            <span className="chip chip-teal">{submissions} response{submissions !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="form-card-footer">
        <span style={{ fontSize: "0.75rem", color: "var(--text-disabled)", fontWeight: 400 }}>
          {formatDate(form.updatedAt)}
        </span>
        <span className={`badge ${isPublished ? "badge-success" : "badge-muted"}`}>
          {isPublished ? "● Live" : "○ Draft"}
        </span>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [forms,           setForms]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [creating,        setCreating]        = useState(false);
  const [newFormTitle,    setNewFormTitle]    = useState("");
  const [newFormDesc,     setNewFormDesc]     = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { loadForms(); }, []);

  async function loadForms() {
    try {
      const data = await formsApi.getAll();
      setForms(data.forms);
    } catch {
      showToast("Failed to load forms.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newFormTitle.trim()) return;
    setCreating(true);
    try {
      const data = await formsApi.create({ title: newFormTitle.trim(), description: newFormDesc.trim() });
      setShowCreateModal(false);
      setNewFormTitle("");
      setNewFormDesc("");
      navigate(`/builder/${data.form._id}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(formId) {
    if (!confirm("Delete this form and all its responses? This cannot be undone.")) return;
    try {
      await formsApi.delete(formId);
      setForms((prev) => prev.filter((f) => f._id !== formId));
      showToast("Form deleted.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleDuplicate(formId) {
    try {
      const data = await formsApi.duplicate(formId);
      setForms((prev) => [data.form, ...prev]);
      showToast("Form duplicated!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const filtered       = forms.filter((f) => f.title.toLowerCase().includes(search.toLowerCase()));
  const totalForms     = forms.length;
  const totalResponses = forms.reduce((s, f) => s + (f.analytics?.submissions || 0), 0);
  const publishedForms = forms.filter((f) => f.settings?.isPublished).length;
  const totalViews     = forms.reduce((s, f) => s + (f.analytics?.views || 0), 0);

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-content">
        {/* Page header */}
        <div className="page-header">
          <div className="page-title-group">
            <h1 className="page-title">My Forms</h1>
            <p className="page-subtitle">Build, share, and track all your forms</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            id="create-form-btn"
          >
            + New Form
          </button>
        </div>

        <div className="page-body">
          {/* Stats — per-spec icon colors */}
          <div className="stats-grid">
            <StatCard
              icon="📋" label="Total Forms" value={totalForms}
              iconColor="#14B8A6" iconBg="rgba(20,184,166,0.12)"
            />
            <StatCard
              icon="✦" label="Published" value={publishedForms}
              iconColor="#22C55E" iconBg="rgba(34,197,94,0.12)"
            />
            <StatCard
              icon="📥" label="Responses" value={totalResponses}
              iconColor="#3B82F6" iconBg="rgba(59,130,246,0.12)"
            />
            <StatCard
              icon="👁" label="Total Views" value={totalViews}
              iconColor="#A855F7" iconBg="rgba(168,85,247,0.12)"
            />
          </div>

          {/* Search bar */}
          {forms.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="search-bar" style={{ flex: 1, maxWidth: "360px" }}>
                <span className="search-icon">⌕</span>
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="search-forms-input"
                />
              </div>
              <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-disabled)" }}>
                {filtered.length} form{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="loading-page" style={{ minHeight: "280px" }}>
              <div className="spinner spinner-lg" style={{ color: "var(--color-primary)" }} />
              <span style={{ color: "var(--text-muted)" }}>Loading your forms...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{search ? "🔍" : "📝"}</div>
              <h3>{search ? "No forms match your search" : "No forms yet"}</h3>
              <p>
                {search
                  ? "Try a different keyword."
                  : "Create your first form to start collecting responses."}
              </p>
              {!search && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Your First Form
                </button>
              )}
            </div>
          ) : (
            <div className="forms-grid">
              {filtered.map((form) => (
                <FormCard
                  key={form._id}
                  form={form}
                  onOpen={() => navigate(`/builder/${form._id}`)}
                  onDelete={() => handleDelete(form._id)}
                  onDuplicate={() => handleDuplicate(form._id)}
                  onResponses={() => navigate(`/forms/${form._id}/responses`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Form Modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Create New Form</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-disabled)", marginTop: "2px" }}>
                  You can edit everything inside the builder
                </p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Form Title *</label>
                <input
                  type="text" className="form-input"
                  placeholder="e.g. Customer Feedback"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  autoFocus id="new-form-title-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="What is this form about?"
                  value={newFormDesc}
                  onChange={(e) => setNewFormDesc(e.target.value)}
                  rows={2}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" className="btn btn-secondary w-full" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit" className="btn btn-primary w-full"
                  disabled={creating || !newFormTitle.trim()} id="create-form-submit-btn"
                >
                  {creating ? <><div className="spinner" /> Creating...</> : "Create & Edit →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
