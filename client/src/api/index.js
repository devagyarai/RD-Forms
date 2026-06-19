const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Central fetch wrapper.
 * Automatically attaches Authorization header if a token exists in localStorage.
 * Throws an error with the server's message on non-2xx responses.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login:    (body) => request("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  me:       ()     => request("/auth/me"),
};

// ── Forms ─────────────────────────────────────────────────────
export const formsApi = {
  getAll:     ()         => request("/forms"),
  create:     (body)     => request("/forms",      { method: "POST",   body: JSON.stringify(body) }),
  getById:    (id)       => request(`/forms/${id}`),
  update:     (id, body) => request(`/forms/${id}`, { method: "PUT",    body: JSON.stringify(body) }),
  delete:     (id)       => request(`/forms/${id}`, { method: "DELETE" }),
  duplicate:  (id)       => request(`/forms/${id}/duplicate`, { method: "POST" }),
  getPublic:  (shareId)  => request(`/forms/share/${shareId}`),
};

// ── Responses ─────────────────────────────────────────────────
export const responsesApi = {
  submit:     (formId, body) => request(`/responses/${formId}`,        { method: "POST", body: JSON.stringify(body) }),
  getAll:     (formId)       => request(`/responses/${formId}`),
  exportData: (formId)       => request(`/responses/${formId}/export`),
};
