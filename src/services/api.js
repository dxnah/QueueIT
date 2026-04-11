const BASE_URL = 'http://127.0.0.1:8000/api';

// ── Core request helper ───────────────────────────────────────────────────────
const request = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  // 204 No Content — DELETE responses have no body
  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    // Surface the Django error message if present
    const message = data?.error || data?.detail || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
};

// ── Vaccines ──────────────────────────────────────────────────────────────────
export const vaccineAPI = {
  getAll:      ()                    => request('/vaccines/'),
  getById:     (id)                  => request(`/vaccines/${id}/`),
  create:      (data)                => request('/vaccines/', 'POST', data),
  update:      (id, data)            => request(`/vaccines/${id}/`, 'PUT', data),
  delete:      (id)                  => request(`/vaccines/${id}/`, 'DELETE'),
  addBatch:    (vaccineId, data)     => request(`/vaccines/${vaccineId}/batches/`, 'POST', data),
  updateBatch: (batchId, data)       => request(`/batches/${batchId}/`, 'PUT', data),
  deleteBatch: (batchId)             => request(`/batches/${batchId}/`, 'DELETE'),
};

// ── Vaccine Orders ────────────────────────────────────────────────────────────
export const orderAPI = {
  getAll:       ()         => request('/orders/'),
  create:       (data)     => request('/orders/', 'POST', data),
  updateStatus: (id, data) => request(`/orders/${id}/`, 'PUT', data),
  delete:       (id)       => request(`/orders/${id}/`, 'DELETE'),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientAPI = {
  getAll: ()         => request('/patients/'),
  update: (id, data) => request(`/patients/${id}/`, 'PUT', data),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const announcementAPI = {
  getAll: ()     => request('/announcements/'),
  create: (data) => request('/announcements/', 'POST', data),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (username, password)        => request('/login/',    'POST', { username, password }),
  register: (username, password, name)  => request('/register/', 'POST', { username, password, name }),
};