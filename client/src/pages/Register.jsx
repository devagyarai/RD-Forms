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

export default function Register({ showToast }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { showToast("Passwords don't match.", "error"); return; }
    if (form.password.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      showToast("Account created! Welcome 🎉", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    } finally { setLoading(false); }
  };

  const pwStrength =
    form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const pwColors = ["", "var(--color-danger)", "var(--color-warning)", "var(--color-success)"];
  const pwLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="auth-page">
      {/* ── Left Panel ── */}
      <div className="auth-panel-left">
        <div className="auth-panel-brand">
          <div className="auth-panel-logo-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.png" alt="RD Forms Logo" style={{ maxWidth: "200px", height: "auto", objectFit: "contain" }} />
          </div>

          <div className="auth-panel-tagline">
            <h2>Start collecting<br />responses today</h2>
            <p>
              Build beautiful forms, share them anywhere, and track every submission.
              Everything you need in one place.
            </p>
          </div>

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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Free forever · No credit card required</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name" type="text" className="form-input"
                placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password" type={showPw ? "text" : "password"} className="form-input"
                  placeholder="At least 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required autoComplete="new-password" style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-disabled)", fontSize: "0.85rem", padding: "4px" }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  <div style={{ flex: 1, height: "3px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(pwStrength / 3) * 100}%`, background: pwColors[pwStrength], borderRadius: "2px", transition: "all 0.25s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: pwColors[pwStrength], minWidth: "40px" }}>{pwLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm" type={showPw ? "text" : "password"} className="form-input"
                placeholder="Repeat your password" value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required autoComplete="new-password"
                style={{ borderColor: form.confirm && form.confirm !== form.password ? "var(--color-danger)" : undefined }}
              />
              {form.confirm && form.confirm !== form.password && (
                <div className="form-error">Passwords don't match</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full"
              disabled={loading} id="register-btn" style={{ marginTop: "4px" }}>
              {loading ? <><div className="spinner" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
