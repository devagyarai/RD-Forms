import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import { formsApi } from "../api";
import { formatDate, truncate } from "../utils/helpers";
import TemplatesGallery from "../components/shared/TemplatesGallery";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, trend, trendUp }) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: '2.5rem', background: 'var(--bg-elevated)', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>{value}</div>
        {trend && (
          <div style={{ fontSize: '0.8rem', color: trendUp ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {trendUp ? '↑' : '↓'} {trend} vs last week
          </div>
        )}
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
      style={{ animation: 'fadeIn 0.3s ease forwards' }}
    >
      <div className="form-card-accent" />

      <div className="form-card-body">
        {/* Header row */}
        <div className="form-card-header">
          <div className="form-card-icon-wrap" style={{ fontSize: '1.5rem', background: 'var(--bg-elevated)', padding: '8px', borderRadius: '8px' }}>
            {isPublished ? '📝' : '✏️'}
          </div>
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
          <div className="form-card-title" style={{ fontSize: '1.2rem', fontWeight: 600 }}>{form.title}</div>
          {form.description && (
            <div className="form-card-desc" style={{ marginTop: "4px", fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {truncate(form.description, 75)}
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="form-card-chips" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <span className="chip chip-muted" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            {fieldCount} field{fieldCount !== 1 ? "s" : ""}
          </span>
          {views > 0 && (
            <span className="chip chip-blue" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}>
              {views} view{views !== 1 ? "s" : ""}
            </span>
          )}
          {submissions > 0 && (
            <span className="chip chip-teal" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(20, 184, 166, 0.1)', color: 'rgb(20, 184, 166)' }}>
              {submissions} response{submissions !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="form-card-footer" style={{ borderTop: '1px solid var(--border-default)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-disabled)", fontWeight: 500 }}>
          Updated {formatDate(form.updatedAt)}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', background: isPublished ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-elevated)', color: isPublished ? 'rgb(34, 197, 94)' : 'var(--text-muted)' }}>
          {isPublished ? "● Live" : "○ Draft"}
        </span>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [forms,           setForms]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [creating,        setCreating]        = useState(false);
  const [newFormTitle,    setNewFormTitle]    = useState("");
  const [newFormDesc,     setNewFormDesc]     = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates,   setShowTemplates]   = useState(false);
  const [formToDelete,    setFormToDelete]    = useState(null);
  const [deleting,        setDeleting]        = useState(false);

  useEffect(() => { 
    loadForms(); 
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

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

  async function handleCreate(e, template = null) {
    if (e) e.preventDefault();
    const title = template ? template.title : newFormTitle.trim();
    if (!title) return;

    setCreating(true);
    try {
      // If template is selected, we'd normally pass template ID to backend
      const data = await formsApi.create({ 
        title: title, 
        description: template ? template.desc : newFormDesc.trim() 
      });
      setShowCreateModal(false);
      setShowTemplates(false);
      setNewFormTitle("");
      setNewFormDesc("");
      navigate(`/builder/${data.form._id}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreating(false);
    }
  }

  async function executeDelete() {
    if (!formToDelete) return;
    setDeleting(true);
    try {
      await formsApi.delete(formToDelete);
      setForms((prev) => prev.filter((f) => f._id !== formToDelete));
      showToast("Form deleted.");
    } catch {
      showToast("Failed to delete form.", "error");
    } finally {
      setDeleting(false);
      setFormToDelete(null);
    }
  }

  async function handleDuplicate(id) {
    try {
      const data = await formsApi.duplicate(id);
      setForms((prev) => [data.form, ...prev]);
      showToast("Form duplicated successfully!");
    } catch {
      showToast("Failed to duplicate form.", "error");
    }
  }

  const filteredForms = forms.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate Real Aggregate Metrics
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.analytics?.submissions || 0), 0);
  const totalViews = forms.reduce((acc, f) => acc + (f.analytics?.views || 0), 0);
  const avgCompletion = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="main-header stagger-1">
          <div>
            <h1 className="main-title">Workspace Dashboard</h1>
            <p className="main-subtitle" style={{ marginTop: '8px' }}>Welcome back! Here's what's happening with your forms today.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setShowTemplates(true)}>
              <span style={{ marginRight: '8px' }}>🎨</span> Use Template
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <span style={{ marginRight: '8px' }}>+</span> Blank Form
            </button>
          </div>
        </header>

        <div className="main-inner" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Productivity Widgets */}
          <section className="stagger-2">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <StatCard icon="📋" label="Total Forms" value={forms.length} />
              <StatCard icon="📥" label="Total Submissions" value={totalSubmissions} />
              <StatCard icon="⚡" label="Avg. Completion Rate" value={`${avgCompletion}%`} />
            </div>
          </section>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            {/* Main Form List Area */}
            <section style={{ flex: 1 }} className="stagger-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Recent Forms</h2>
                <div className="search-bar" style={{ width: '300px', margin: 0 }}>
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search forms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" />)}
                </div>
              ) : forms.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✨</div>
                  <h3>Create your first form</h3>
                  <p>Start from scratch or use one of our professional templates to hit the ground running.</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowTemplates(true)}>Browse Templates</button>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Blank Form</button>
                  </div>
                </div>
              ) : filteredForms.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>No forms found</h3>
                  <p>No forms match your search "<b>{search}</b>". Try a different keyword.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {filteredForms.map((form) => (
                    <FormCard
                      key={form._id}
                      form={form}
                      onOpen={() => navigate(`/builder/${form._id}`)}
                      onDelete={() => setFormToDelete(form._id)}
                      onDuplicate={() => handleDuplicate(form._id)}
                      onResponses={() => navigate(`/responses/${form._id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Real Activity Feed Placeholder */}
            <aside style={{ width: '320px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', padding: '24px', flexShrink: 0 }} className="desktop-only stagger-4">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)' }}>⚡</span> Recent Forms
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {forms.slice(0, 4).map(f => (
                  <div key={f._id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {f.settings?.isPublished ? '🚀' : '✏️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-heading)', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {f.analytics?.submissions || 0} Submissions
                      </div>
                    </div>
                  </div>
                ))}
                {forms.length === 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Create a form to see activity.
                  </div>
                )}
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: '24px', fontSize: '0.85rem' }} onClick={() => navigate('/analytics')}>View Detailed Analytics</button>
            </aside>
          </div>
        </div>
      </main>

      {/* Templates Gallery */}
      <TemplatesGallery 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
        onSelect={(t) => handleCreate(null, t)}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Create New Form</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start with a blank canvas.</p>
            <form onSubmit={(e) => handleCreate(e)}>
              <div className="form-group">
                <label className="form-label">Form Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="e.g. Employee Feedback"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={newFormDesc}
                  onChange={(e) => setNewFormDesc(e.target.value)}
                  placeholder="Briefly describe the purpose of this form."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating || !newFormTitle.trim()}>
                  {creating ? "Creating..." : "Create Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {formToDelete && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setFormToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--color-danger)' }}>Delete Form</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Are you sure you want to delete this form? This action cannot be undone and all responses will be lost.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setFormToDelete(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={executeDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
