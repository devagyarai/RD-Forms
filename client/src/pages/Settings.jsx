import { useState } from 'react';
import Sidebar from '../components/shared/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const THEMES = [
  { id: 'midnight-dark', name: 'Midnight Dark' },
  { id: 'ocean-blue', name: 'Ocean Blue' },
  { id: 'minimal-white', name: 'Minimal White' },
  { id: 'professional-gray', name: 'Professional Gray' },
  { id: 'emerald-green', name: 'Emerald Green' },
  { id: 'royal-purple', name: 'Royal Purple' },
  { id: 'sunset-orange', name: 'Sunset Orange' },
];

const ACCENT_COLORS = [
  { id: '#14B8A6', name: 'Teal (Default)' },
  { id: '#0284C7', name: 'Ocean Blue' },
  { id: '#22C55E', name: 'Emerald' },
  { id: '#A855F7', name: 'Purple' },
  { id: '#EA580C', name: 'Orange' },
  { id: '#EF4444', name: 'Red' },
  { id: '#64748B', name: 'Slate' },
];

export default function Settings({ showToast }) {
  const { theme, setTheme, accentColor, setAccentColor, borderRadius, setBorderRadius } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="settings-title">Appearance</h2>
            <p className="settings-subtitle">Customize how RD Forms looks and feels.</p>

            <div className="settings-group">
              <label className="settings-label">Theme</label>
              <div className="theme-grid">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-btn ${theme === t.id ? 'active' : ''}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div className="theme-preview" data-theme={t.id}>
                      <div className="theme-preview-nav"></div>
                      <div className="theme-preview-body"></div>
                    </div>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-group">
              <label className="settings-label">Accent Color</label>
              <div className="color-grid">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    className={`color-btn ${accentColor === c.id || (!accentColor && c.id === '#14B8A6') ? 'active' : ''}`}
                    style={{ backgroundColor: c.id }}
                    onClick={() => setAccentColor(c.id === '#14B8A6' ? '' : c.id)}
                    title={c.name}
                  >
                    {(accentColor === c.id || (!accentColor && c.id === '#14B8A6')) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-group">
              <label className="settings-label">Border Radius</label>
              <div className="radius-grid">
                {['compact', 'default', 'rounded'].map((rad) => (
                  <button
                    key={rad}
                    className={`radius-btn ${borderRadius === rad ? 'active' : ''}`}
                    onClick={() => setBorderRadius(rad)}
                  >
                    {rad.charAt(0).toUpperCase() + rad.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="settings-actions">
              <button className="btn btn-primary" onClick={() => showToast('success', 'Appearance settings saved!')}>Save Preferences</button>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="settings-title">Account</h2>
            <p className="settings-subtitle">Manage your personal profile and preferences.</p>
            <div className="settings-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" defaultValue={user?.name || "User"} />
            </div>
            <div className="settings-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" defaultValue={user?.email || ""} disabled />
            </div>
            <div className="settings-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows="3" placeholder="Tell us about yourself..." />
            </div>
            <div className="settings-actions">
              <button className="btn btn-primary" onClick={() => showToast('success', 'Account updated!')}>Update Profile</button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="settings-title">Security</h2>
            <p className="settings-subtitle">Keep your account secure.</p>
            <div className="settings-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="settings-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="settings-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-card)', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--text-heading)' }}>Two-Factor Authentication</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add an extra layer of security to your account.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('info', '2FA Setup coming soon')}>Enable</button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="settings-title">Notifications</h2>
            <p className="settings-subtitle">Choose what you want to be notified about.</p>
            <div className="settings-group">
              {['Email Notifications', 'Browser Notifications', 'Submission Alerts', 'Weekly Reports'].map((item) => (
                <label key={item} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", marginBottom: '8px', cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked={true} style={{ accentColor: "var(--color-primary)", width: "16px", height: "16px" }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-body)" }}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="settings-title">About</h2>
            <p className="settings-subtitle">Information about RD Forms.</p>
            <div className="settings-group" style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
              <h3 style={{ color: 'var(--text-heading)', marginBottom: '4px' }}>RD Forms v2.0.0</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>The premium dynamic form builder.</p>
              <a href="https://github.com/devagyarai/RD-Forms" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View on GitHub</a>
            </div>
          </div>
        );
      default:
        return (
          <div className="settings-section">
            <h2 className="settings-title">Coming Soon</h2>
            <p className="settings-subtitle">This section is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="page-header">
          <div className="page-title-group">
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your application preferences and account.</p>
          </div>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {[
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'appearance', label: 'Appearance', icon: '🎨' },
                { id: 'account', label: 'Account', icon: '👤' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'privacy', label: 'Privacy', icon: '🛡️' },
                { id: 'about', label: 'About', icon: 'ℹ️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-content">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
