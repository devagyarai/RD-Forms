import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/helpers";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="top-nav">
      {/* Logo */}
      <NavLink to="/dashboard" className="top-nav-logo">
        <div className="top-nav-logo-icon">📋</div>
        <span className="top-nav-logo-text">RD Forms</span>
      </NavLink>

      {/* Nav links */}
      <div className="top-nav-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
          id="nav-dashboard"
        >
          <span>⊞</span> Dashboard
        </NavLink>
      </div>

      {/* Right: user chip + logout */}
      <div className="top-nav-right">
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
    </nav>
  );
}
