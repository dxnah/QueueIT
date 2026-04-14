const BASE_URL = 'http://127.0.0.1:8000/api';

// ── Core request helper ───────────────────────────────────────────────────────
const request = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error || data?.detail || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
};

// ── Vaccines ──────────────────────────────────────────────────────────────────
export const vaccineAPI = {
  getAll:      ()                => request('/vaccines/'),
  getById:     (id)              => request(`/vaccines/${id}/`),
  create:      (data)            => request('/vaccines/', 'POST', data),
  update:      (id, data)        => request(`/vaccines/${id}/`, 'PUT', data),
  delete:      (id)              => request(`/vaccines/${id}/`, 'DELETE'),
  addBatch:    (vaccineId, data) => request(`/vaccines/${vaccineId}/batches/`, 'POST', data),
  updateBatch: (batchId, data)   => request(`/batches/${batchId}/`, 'PUT', data),
  deleteBatch: (batchId)         => request(`/batches/${batchId}/`, 'DELETE'),
};

// ── Vaccine Orders ────────────────────────────────────────────────────────────
// vaccine and supplier are stored as plain strings (names) in the DB
// price_per_piece matches the model field name
export const orderAPI = {
  getAll:       ()         => request('/orders/'),
  create:       (data)     => request('/orders/', 'POST', data),
  updateStatus: (id, data) => request(`/orders/${id}/`, 'PATCH', data),
  delete:       (id)       => request(`/orders/${id}/`, 'DELETE'),
};

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const supplierAPI = {
  getAll: () => request('/suppliers/'),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientAPI = {
  getAll: ()         => request('/patients/'),
  update: (id, data) => request(`/patients/${id}/`, 'PUT', data),
  delete: (id)       => request(`/patients/${id}/`, 'DELETE'),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const announcementAPI = {
  getAll: ()     => request('/announcements/'),
  create: (data) => request('/announcements/', 'POST', data),
};

// ── Vaccine Usage Reports ─────────────────────────────────────────────────────
export const usageReportAPI = {
  getAll: ()         => request('/usage-reports/'),
  create: (data)     => request('/usage-reports/', 'POST', data),
  update: (id, data) => request(`/usage-reports/${id}/`, 'PUT', data),
  delete: (id)       => request(`/usage-reports/${id}/`, 'DELETE'),
};

// ── Stock Level Reports ───────────────────────────────────────────────────────
export const stockReportAPI = {
  getAll: ()         => request('/stock-reports/'),
  create: (data)     => request('/stock-reports/', 'POST', data),
  update: (id, data) => request(`/stock-reports/${id}/`, 'PUT', data),
  delete: (id)       => request(`/stock-reports/${id}/`, 'DELETE'),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (username, password)       => request('/login/',  'POST', { username, password }),
  register: (username, password, name) => request('/signup/', 'POST', { username, password, name }),
};