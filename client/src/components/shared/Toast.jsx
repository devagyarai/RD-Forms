/**
 * Toast notification display component.
 * Reads from the toasts array provided by useToast hook.
 */
export function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => onRemove(toast.id)}
          role="alert"
        >
          <span>{icons[toast.type] || "ℹ"}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
