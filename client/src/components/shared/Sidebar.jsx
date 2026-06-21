import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/helpers";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="top-nav">
        <button 
          className="hamburger-btn" 
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        {/* Logo */}
        <NavLink to="/dashboard" className="top-nav-logo" onClick={() => setMobileOpen(false)}>
          <div className="top-nav-logo-icon">📋</div>
          <span className="top-nav-logo-text">RD Forms</span>
        </NavLink>

        {/* Desktop Nav links */}
        <div className="top-nav-links desktop-only">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            id="nav-dashboard"
          >
            <span>⊞</span> Dashboard
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            id="nav-analytics"
          >
            <span>📈</span> Analytics
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            id="nav-settings"
          >
            <span>⚙️</span> Settings
          </NavLink>
        </div>

        {/* Right: user chip + logout */}
        <div className="top-nav-right desktop-only">
          {user && (
            <>
              <button 
                className="btn btn-ghost btn-icon" 
                title="Search (Ctrl+K)" 
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              >
                🔍
              </button>

              <div style={{ position: 'relative' }}>
                <button 
                  className="btn btn-ghost btn-icon" 
                  title="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  🔔
                  <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: 'var(--color-danger)', borderRadius: '50%' }}></span>
                </button>
                {showNotifications && (
                  <div className="dropdown-menu animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '300px', marginTop: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Notifications
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer' }}>Mark all read</span>
                    </div>
                    <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                      🎉 You're all caught up!
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <div className="user-chip" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowProfile(!showProfile)}>
                  <div className="user-avatar">{getInitials(user.name)}</div>
                  <span className="user-name">{user.name?.split(" ")[0]} ▾</span>
                </div>
                {showProfile && (
                  <div className="dropdown-menu animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '220px', marginTop: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lg)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 12px' }} onClick={() => { navigate('/settings?tab=account'); setShowProfile(false); }}>👤 View Profile</button>
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 12px' }} onClick={() => { navigate('/settings'); setShowProfile(false); }}>⚙️ Preferences</button>
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 12px' }} onClick={() => { window.dispatchEvent(new Event('open-shortcuts')); setShowProfile(false); }}>⌨️ Shortcuts</button>
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }}></div>
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 12px', color: 'var(--color-danger)' }} onClick={handleLogout}>🚪 Sign out</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile User Avatar Only (Top Right) */}
        <div className="mobile-only" style={{ marginLeft: "auto" }}>
          {user && (
            <div className="user-avatar" style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}>
              {getInitials(user.name)}
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile Drawer ── */}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <div className="top-nav-logo">
            <div className="top-nav-logo-icon">📋</div>
            <span className="top-nav-logo-text">RD Forms</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-content">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <span>⊞</span> Dashboard
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <span>⚙️</span> Settings
          </NavLink>
        </div>

        {user && (
          <div className="mobile-drawer-footer">
            <div className="user-chip" style={{ width: "100%", justifyContent: "center", marginBottom: "12px", background: "var(--bg-base)" }}>
              <div className="user-avatar">{getInitials(user.name)}</div>
              <span className="user-name" style={{ display: "block" }}>{user.name}</span>
            </div>
            <button className="btn btn-secondary w-full" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
