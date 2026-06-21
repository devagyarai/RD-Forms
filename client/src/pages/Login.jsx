import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  "Drag & drop form builder",
  "Shareable link + QR code",
  "Real-time response tracking",
  "Analytics dashboard",
  "CSV export",
  "Secure JWT authentication",
];

export default function Login({ showToast }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left Panel ── */}
      <div className="auth-panel-left">
        <div className="auth-panel-brand">
          <div className="auth-panel-logo-wrap">
            <div className="auth-panel-logo-icon" style={{ background: "#FFFFFF" }}>
              <img src="/logo.png" alt="RD Forms Logo Icon" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-heading)" }}>RD Forms</div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Form Builder</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="auth-panel-tagline">
            <h2>Build forms that<br />actually get filled</h2>
            <p>
              Create, publish, and share professional forms in minutes.
              Track responses and export data — all in one clean dashboard.
            </p>
          </div>

          {/* Features */}
          <div className="auth-features">
            {FEATURES.map((f) => (
              <div className="auth-feature-item" key={f}>
                <div className="auth-feature-dot" />
                <span className="auth-feature-text">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel-bottom">
          <p>ReadyNest Full Stack Internship · RD Forms v1.0</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-panel-right">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer",
                    color: "var(--text-disabled)", fontSize: "0.85rem", padding: "4px",
                  }}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              id="login-btn"
              style={{ marginTop: "4px" }}
            >
              {loading ? <><div className="spinner" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
