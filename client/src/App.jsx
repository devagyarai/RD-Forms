import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useToast } from "./hooks/useToast";
import { ToastContainer } from "./components/shared/Toast";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import FormResponses from "./pages/FormResponses";
import Settings from "./pages/Settings";
import PublicForm from "./pages/PublicForm";

// Route guard — redirects unauthenticated users to login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" style={{ color: "var(--color-primary)" }} />
        <span>Loading...</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Route guard — redirects authenticated users away from auth pages
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <>
      <Routes>
        {/* Auth pages */}
        <Route path="/login"    element={<GuestRoute><Login showToast={showToast} /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register showToast={showToast} /></GuestRoute>} />

        {/* Protected pages */}
        <Route path="/dashboard"            element={<ProtectedRoute><Dashboard showToast={showToast} /></ProtectedRoute>} />
        <Route path="/settings"             element={<ProtectedRoute><Settings showToast={showToast} /></ProtectedRoute>} />
        <Route path="/builder/:id"          element={<ProtectedRoute><FormBuilder showToast={showToast} /></ProtectedRoute>} />
        <Route path="/forms/:id/responses"  element={<ProtectedRoute><FormResponses showToast={showToast} /></ProtectedRoute>} />

        {/* Public page — no auth needed */}
        <Route path="/form/:shareId" element={<PublicForm showToast={showToast} />} />

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
