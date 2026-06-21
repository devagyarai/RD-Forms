import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/helpers";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              <div className="user-chip">
                <div className="user-avatar">{getInitials(user.name)}</div>
                <span className="user-name">{user.name?.split(" ")[0]}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                id="logout-btn"
                title="Sign out"
              >
                Sign out
              </button>
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
