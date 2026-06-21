import { useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import { useTheme } from "../context/ThemeContext";

export default function Settings({ showToast }) {
  const [activeTab, setActiveTab] = useState("appearance");
  const { theme, setTheme, accentColor, setAccentColor, borderRadius, setBorderRadius } = useTheme();

  const THEMES = [
    { id: "midnight", name: "Midnight Dark", desc: "Sleek and professional dark mode." },
    { id: "ocean", name: "Ocean Blue", desc: "Calming oceanic tones." },
    { id: "minimal", name: "Minimal White", desc: "Clean, high-contrast light mode." },
    { id: "professional", name: "Professional Gray", desc: "Subtle neutral grays." },
    { id: "emerald", name: "Emerald Green", desc: "Vibrant and energetic." },
    { id: "royal", name: "Royal Purple", desc: "Elegant and premium." },
    { id: "sunset", name: "Sunset Orange", desc: "Warm and inviting." }
  ];

  const ACCENTS = ["#3B82F6", "#14B8A6", "#8B5CF6", "#F43F5E", "#EAB308", "#10B981", "#F97316"];
  const RADIUS_OPTIONS = [
    { id: "compact", name: "Compact", value: "8px" },
    { id: "default", name: "Default", value: "16px" },
    { id: "rounded", name: "Rounded", value: "24px" }
  ];

  const handleSave = () => {
    showToast("Preferences saved successfully!", "success");
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <h1 className="main-title">Settings Center</h1>
          <p className="main-subtitle" style={{ marginTop: '8px' }}>Manage your workspace, preferences, and account.</p>
        </header>

        <div className="main-inner settings-layout">
          {/* Inner Sidebar for Settings */}
          <aside className="settings-sidebar">
            <div className="settings-nav">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '16px' }}>Organization</div>
              <button className={`settings-nav-btn ${activeTab === "workspace" ? "active" : ""}`} onClick={() => setActiveTab("workspace")}><span>🏢</span> Workspace</button>
              <button className={`settings-nav-btn ${activeTab === "customization" ? "active" : ""}`} onClick={() => setActiveTab("customization")}><span>✨</span> Customization</button>
              
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '24px 0 8px', paddingLeft: '16px' }}>Personal</div>
              <button className={`settings-nav-btn ${activeTab === "appearance" ? "active" : ""}`} onClick={() => setActiveTab("appearance")}><span>🎨</span> Appearance</button>
              <button className={`settings-nav-btn ${activeTab === "account" ? "active" : ""}`} onClick={() => setActiveTab("account")}><span>👤</span> Account</button>
              <button className={`settings-nav-btn ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}><span>🔔</span> Notifications</button>
              <button className={`settings-nav-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}><span>🔒</span> Security</button>
              
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '24px 0 8px', paddingLeft: '16px' }}>System</div>
              <button className={`settings-nav-btn ${activeTab === "developer" ? "active" : ""}`} onClick={() => setActiveTab("developer")}><span>💻</span> Developer API</button>
              <button className={`settings-nav-btn ${activeTab === "help" ? "active" : ""}`} onClick={() => setActiveTab("help")}><span>❓</span> Help Center</button>
              <button className={`settings-nav-btn ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}><span>ℹ️</span> System Status</button>
            </div>
          </aside>

          {/* Settings Content Area */}
          <div className="settings-content">
            
            {activeTab === "workspace" && (
              <div className="animate-fade-in">
                <h2 className="settings-title">Workspace Settings</h2>
                <p className="settings-subtitle">Manage your team and billing details.</p>
                
                <div className="settings-group">
                  <label className="settings-label">Workspace Name</label>
                  <input type="text" className="form-input" defaultValue="My Company Workspace" />
                </div>
                <div className="settings-group">
                  <label className="settings-label">Custom Domain</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" className="form-input" placeholder="forms.mycompany.com" disabled />
                    <button className="btn btn-secondary">Upgrade to Pro</button>
                  </div>
                </div>
                <div className="settings-actions"><button className="btn btn-primary" onClick={handleSave}>Save Workspace</button></div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="animate-fade-in">
                <h2 className="settings-title">Appearance</h2>
                <p className="settings-subtitle">Customize how RD Forms looks and feels for you.</p>

                <div className="settings-group">
                  <label className="settings-label">Theme</label>
                  <div className="theme-grid">
                    {THEMES.map(t => (
                      <div key={t.id} className={`theme-btn ${theme === t.id ? "active" : ""}`} onClick={() => setTheme(t.id)}>
                        <div className="theme-preview" style={{ 
                          background: t.id === 'minimal' ? '#ffffff' : t.id.includes('dark') ? '#0f172a' : 'var(--bg-base)',
                          borderColor: t.id === 'minimal' ? '#e2e8f0' : 'transparent'
                        }}>
                          <div className="theme-preview-nav" style={{ background: t.id === 'minimal' ? '#f8fafc' : 'var(--bg-elevated)' }}></div>
                          <div className="theme-preview-body" style={{ background: t.id === 'minimal' ? '#ffffff' : 'var(--bg-surface)' }}></div>
                        </div>
                        <span>{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Accent Color</label>
                  <div className="color-grid">
                    {ACCENTS.map(color => (
                      <button key={color} className={`color-btn ${accentColor === color ? "active" : ""}`} style={{ backgroundColor: color }} onClick={() => setAccentColor(color)}>
                        {accentColor === color && "✓"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Border Radius</label>
                  <div className="radius-grid">
                    {RADIUS_OPTIONS.map(opt => (
                      <button key={opt.id} className={`radius-btn ${borderRadius === opt.value ? "active" : ""}`} onClick={() => setBorderRadius(opt.value)}>
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="settings-actions"><button className="btn btn-primary" onClick={handleSave}>Save Preferences</button></div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-fade-in">
                <h2 className="settings-title">Notifications</h2>
                <p className="settings-subtitle">Control when and how you are notified.</p>
                
                <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>New Form Submissions</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get an email when someone submits a form.</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Weekly Digest</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>A summary of your form performance every Monday.</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                  </label>
                </div>
                <div className="settings-actions"><button className="btn btn-primary" onClick={handleSave}>Save Notifications</button></div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="animate-fade-in">
                <h2 className="settings-title">Help Center</h2>
                <p className="settings-subtitle">Find answers and get support.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                  <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📖</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Documentation</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Read our comprehensive guides on how to use RD Forms.</p>
                    <button className="btn btn-secondary btn-sm">Read Docs</button>
                  </div>
                  <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Contact Support</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Can't find what you need? Reach out to our team.</p>
                    <button className="btn btn-secondary btn-sm">Message Support</button>
                  </div>
                </div>

                <div className="settings-group">
                  <label className="settings-label">Frequently Asked Questions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['How do I embed a form?', 'Can I export responses to Excel?', 'Is there an API available?'].map((q, i) => (
                      <div key={i} style={{ padding: '16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)' }}>
                        <div style={{ fontWeight: 600 }}>{q}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Click to view the detailed answer in our documentation portal.</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="animate-fade-in">
                <h2 className="settings-title">System Status</h2>
                <p className="settings-subtitle">Real-time operational status of RD Forms infrastructure.</p>
                
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden', marginBottom: '40px' }}>
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px var(--color-success)' }}></div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>All Systems Operational</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updated 2 mins ago</span>
                  </div>
                  <div style={{ padding: '0' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>Frontend App</span>
                      <span style={{ color: 'var(--color-success)' }}>Operational</span>
                    </div>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>Forms API</span>
                      <span style={{ color: 'var(--color-success)' }}>Operational</span>
                    </div>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>Database Cluster</span>
                      <span style={{ color: 'var(--color-success)' }}>Operational</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-primary)' }}>RD</div>
                  <div style={{ fontWeight: 600 }}>RD Forms Enterprise</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Version 2.0.0 (Build 492)</div>
                </div>
              </div>
            )}

            {/* Fallback for other tabs */}
            {["customization", "account", "security", "developer"].includes(activeTab) && (
              <div className="animate-fade-in">
                <h2 className="settings-title" style={{ textTransform: 'capitalize' }}>{activeTab}</h2>
                <p className="settings-subtitle">Manage your {activeTab} settings.</p>
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-state-icon">🚧</div>
                  <h3>Under Construction</h3>
                  <p>This settings panel is being upgraded for the Enterprise release.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
