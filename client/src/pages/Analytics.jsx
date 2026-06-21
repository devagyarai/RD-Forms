import { useState, useEffect } from "react";
import Sidebar from "../components/shared/Sidebar";
import { formsApi } from "../api";
import { downloadCSV } from "../utils/helpers";

export default function Analytics({ showToast }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    formsApi.getAll()
      .then(data => setForms(data.forms))
      .catch(() => showToast("Failed to load forms data.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = forms.reduce((acc, f) => acc + (f.analytics?.views || 0), 0);
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.analytics?.submissions || 0), 0);
  const avgCompletion = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

  // Use real data for chart (Top 7 Forms by Submissions)
  const topFormsForChart = [...forms].sort((a, b) => (b.analytics?.submissions || 0) - (a.analytics?.submissions || 0)).slice(0, 7);
  const maxTrend = topFormsForChart.length > 0 ? Math.max(...topFormsForChart.map(f => f.analytics?.submissions || 0), 1) : 1;

  const handleDownload = () => {
    if (forms.length === 0) {
      showToast("No data to export.", "error");
      return;
    }
    const rows = forms.map(f => ({
      "Form Title": f.title,
      "Status": f.settings?.isPublished ? "Live" : "Draft",
      "Total Views": f.analytics?.views || 0,
      "Total Submissions": f.analytics?.submissions || 0,
      "Completion Rate (%)": Math.round(((f.analytics?.submissions || 0) / Math.max(f.analytics?.views || 1, 1)) * 100),
      "Created At": new Date(f.createdAt).toLocaleDateString()
    }));
    downloadCSV(rows, "workspace_analytics_report.csv");
    showToast("Report downloaded successfully!", "success");
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <div>
            <h1 className="main-title">Workspace Analytics</h1>
            <p className="main-subtitle" style={{ marginTop: '8px' }}>High-level insights into your forms' performance.</p>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={handleDownload} disabled={forms.length === 0}>
              Download Report
            </button>
          </div>
        </header>

        <div className="main-inner" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Views</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{totalViews.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Submissions</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{totalSubmissions.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Avg Completion Rate</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{avgCompletion}%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {/* Chart Area */}
            <div style={{ flex: '2 1 500px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Forms by Submissions</h3>
              <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
                {topFormsForChart.length === 0 ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No form data available to chart.
                  </div>
                ) : topFormsForChart.map((f, i) => {
                  const val = f.analytics?.submissions || 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }} title={f.title}>
                      <div style={{ 
                        width: '100%', 
                        height: `${(val / maxTrend) * 250}px`, 
                        minHeight: val > 0 ? '4px' : '0',
                        background: 'var(--color-primary)', 
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 1s ease',
                        opacity: 1 - (i * 0.1)
                      }}></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                        {f.title.substring(0, 10)}
                      </div>
                      {val > 0 && (
                        <div style={{ position: 'absolute', top: '-24px', fontSize: '0.75rem', fontWeight: 600 }}>{val}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Forms */}
            <div style={{ flex: '1 1 300px', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Top Performing Forms</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                  <div className="skeleton skeleton-card" style={{ height: '200px' }} />
                ) : forms.slice(0, 5).map(f => (
                  <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.analytics?.submissions || 0} submissions</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                      {Math.round(((f.analytics?.submissions || 0) / Math.max(f.analytics?.views || 1, 1)) * 100)}%
                    </div>
                  </div>
                ))}
                {forms.length === 0 && !loading && (
                   <div className="empty-state" style={{ padding: '24px' }}>
                     <div style={{ fontSize: '2rem' }}>📈</div>
                     <p style={{ margin: 0, marginTop: '8px', fontSize: '0.9rem' }}>No forms yet. Check back once you start gathering data.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
