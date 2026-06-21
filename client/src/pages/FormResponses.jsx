import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { responsesApi } from "../api";
import { formatDateTime, downloadCSV } from "../utils/helpers";
import Sidebar from "../components/shared/Sidebar";

export default function FormResponses({ showToast }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Advanced Table State
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'submitted', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState({}); // { fieldId: boolean }
  const [showColMenu, setShowColMenu] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    responsesApi
      .getAll(id)
      .then((d) => {
        setData(d);
        // Initialize column visibility
        const cols = {};
        d.form?.fields?.forEach(f => cols[f.id] = true);
        setVisibleColumns(cols);
      })
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

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === processedResponses.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedResponses.map(r => r._id)));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleDeleteSelected = () => {
    // In a real app, call API to delete multiple.
    // For now, mock it locally.
    const remaining = data.responses.filter(r => !selectedRows.has(r._id));
    setData({ ...data, responses: remaining });
    setSelectedRows(new Set());
    showToast("Deleted selected responses", "success");
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <div className="loading-page">
            <div className="spinner spinner-lg" style={{ color: "var(--color-primary)" }} />
            Loading responses...
          </div>
        </main>
      </div>
    );
  }

  const form = data?.form;
  const responses = data?.responses || [];
  const totalFields = form?.fields || [];

  // 1. Filter
  const filtered = search
    ? responses.filter((r) => {
        const values = Object.values(r.answers || {}).join(" ").toLowerCase();
        return values.includes(search.toLowerCase());
      })
    : responses;

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortConfig.key === 'submitted') {
      const aTime = new Date(a.submittedAt || a.createdAt).getTime();
      const bTime = new Date(b.submittedAt || b.createdAt).getTime();
      return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
    }
    // Dynamic field sorting
    const aVal = a.answers?.[sortConfig.key] || "";
    const bVal = b.answers?.[sortConfig.key] || "";
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const processedResponses = sorted;

  // 3. Paginate
  const totalPages = Math.ceil(processedResponses.length / itemsPerPage);
  const paginated = processedResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: '8px' }}>
              <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: 0 }}>← Back to Dashboard</Link>
            </div>
            <h1 className="main-title">{form?.title}</h1>
            <p className="main-subtitle">{responses.length} total response{responses.length !== 1 ? "s" : ""}</p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: 'center' }}>
            <Link to={`/builder/${id}`} className="btn btn-secondary">
              <span style={{ marginRight: '8px' }}>✏️</span> Edit Form
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={exporting || responses.length === 0}
              title={responses.length === 0 ? "No responses to export yet" : "Download responses as CSV"}
            >
              {exporting ? <><div className="spinner" /> Exporting...</> : "⬇ Export CSV"}
            </button>
          </div>
        </header>

        <div className="main-inner">
          {/* Advanced Toolbar */}
          <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="search-bar" style={{ margin: 0, width: '300px' }}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search all responses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: 'var(--bg-input)' }}
                />
              </div>

              {selectedRows.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedRows.size} selected</span>
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>Delete</button>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowColMenu(!showColMenu)}>
                👁 Columns ▾
              </button>
              {showColMenu && (
                <div className="dropdown-menu animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '200px', marginTop: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: '8px', zIndex: 100, boxShadow: 'var(--shadow-lg)' }}>
                  {totalFields.map(f => (
                    <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={visibleColumns[f.id] !== false}
                        onChange={(e) => setVisibleColumns(prev => ({ ...prev, [f.id]: e.target.checked }))}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {processedResponses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{search ? "🔍" : "📭"}</div>
              <h3>{search ? "No matching responses" : "Waiting for your first response!"}</h3>
              <p>
                {search
                  ? "Try a different keyword or clear filters."
                  : "Share your form to start collecting data."}
              </p>
            </div>
          ) : (
            <div className="stagger-2" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div className="table-wrapper">
                <table className="response-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                    <tr>
                      <th style={{ padding: '16px', width: '40px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedRows.size === processedResponses.length && processedResponses.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('submitted')}>
                        Submitted Date {sortConfig.key === 'submitted' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      {totalFields.filter(f => visibleColumns[f.id] !== false).map((field) => (
                        <th key={field.id} style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(field.id)}>
                          {field.label} {sortConfig.key === field.id ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((response) => (
                      <tr key={response._id} style={{ borderBottom: '1px solid var(--border-subtle)', background: selectedRows.has(response._id) ? 'var(--color-primary-glow)' : 'transparent' }}>
                        <td style={{ padding: '16px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedRows.has(response._id)}
                            onChange={() => toggleSelectRow(response._id)}
                          />
                        </td>
                        <td style={{ padding: '16px', whiteSpace: "nowrap", fontSize: "0.85rem", color: 'var(--text-body)' }}>
                          {formatDateTime(response.submittedAt || response.createdAt)}
                        </td>
                        {totalFields.filter(f => visibleColumns[f.id] !== false).map((field) => {
                          const val = response.answers?.[field.id] ?? response.answers?.get?.(field.id) ?? "—";
                          const display = Array.isArray(val) ? val.join(", ") : String(val);
                          return (
                            <td key={field.id} title={display} style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-heading)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedResponses.length)} of {processedResponses.length} entries
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{ width: '32px', padding: 0 }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      className="btn btn-secondary btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
