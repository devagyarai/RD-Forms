import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { responsesApi } from "../api";
import { formatDateTime, downloadCSV } from "../utils/helpers";
import Sidebar from "../components/shared/Sidebar";

export default function FormResponses({ showToast }) {
  const { id } = useParams();
  const [data, setData] = useState(null); // { responses, form }
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => `${window.location.origin}/form/${data?.form?.shareId}`;

  const copyLink = () => {
    if (!data?.form?.shareId) return;
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl).catch(() => {
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

  useEffect(() => {
    responsesApi
      .getAll(id)
      .then((d) => setData(d))
      .catch(() => showToast("Failed to load responses.", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await responsesApi.exportData(id);
      downloadCSV(result.rows, `${result.formTitle}_responses.csv`);
      showToast("Exported to CSV!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <div className="loading-page">
            <div className="spinner spinner-lg" style={{ color: "var(--color-primary)" }} />
            Loading responses...
          </div>
        </div>
      </div>
    );
  }

  const form = data?.form;
  const responses = data?.responses || [];

  // Filter by any field value containing the search string
  const filtered = search
    ? responses.filter((r) => {
        const values = Object.values(r.answers || {}).join(" ").toLowerCase();
        return values.includes(search.toLowerCase());
      })
    : responses;

  const totalFields = form?.fields || [];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-title-group">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back</Link>
            </div>
            <h1 className="page-title" style={{ fontSize: "1.4rem", marginTop: "8px" }}>
              {form?.title}
            </h1>
            <p className="page-subtitle">{responses.length} total response{responses.length !== 1 ? "s" : ""}</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              onClick={handleExport}
              disabled={exporting || responses.length === 0}
              id="export-csv-btn"
            >
              {exporting ? <><div className="spinner" /> Exporting...</> : "⬇ Export CSV"}
            </button>
            <Link to={`/builder/${id}`} className="btn btn-primary">
              Edit Form
            </Link>
          </div>
        </div>

        <div className="page-body">
          {/* Analytics cards */}
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>📥</div>
              <div className="stat-label">Total Responses</div>
              <div className="stat-value">{responses.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(168,85,247,0.12)", color: "#A855F7" }}>👁</div>
              <div className="stat-label">Form Views</div>
              <div className="stat-value">{form?.analytics?.views || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>📊</div>
              <div className="stat-label">Completion Rate</div>
              <div className="stat-value">
                {form?.analytics?.views
                  ? `${Math.round((responses.length / form.analytics.views) * 100)}%`
                  : "—"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6" }}>📝</div>
              <div className="stat-label">Form Fields</div>
              <div className="stat-value">{totalFields.length}</div>
            </div>
          </div>

          {/* Search */}
          {responses.length > 0 && (
            <div className="search-bar" style={{ marginBottom: "16px", maxWidth: "360px" }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search responses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* Responses table */}
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ marginTop: "20px" }}>
              <div className="empty-state-icon">{search ? "🔍" : "📭"}</div>
              <h3>{search ? "No matching responses" : "Waiting for your first response!"}</h3>
              <p>
                {search
                  ? "Try a different keyword."
                  : "Your form is ready. Share it with your audience to start collecting responses."}
              </p>
              {!search && form?.shareId && (
                <button
                  className={`btn ${copied ? "btn-secondary" : "btn-primary"}`}
                  style={{ marginTop: "16px" }}
                  onClick={copyLink}
                >
                  {copied ? "✓ Link Copied!" : "🔗 Copy Share Link"}
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="response-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Submitted</th>
                    {totalFields.map((field) => (
                      <th key={field.id}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((response, index) => (
                    <tr key={response._id}>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {filtered.length - index}
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                        {formatDateTime(response.submittedAt || response.createdAt)}
                      </td>
                      {totalFields.map((field) => {
                        const val = response.answers?.[field.id] ?? response.answers?.get?.(field.id) ?? "—";
                        const display = Array.isArray(val) ? val.join(", ") : String(val);
                        return (
                          <td key={field.id} title={display}>
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
