const BASE_URL = 'http://127.0.0.1:8001/api';

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
  getAll:  () => request('/vaccines/'),
  getById: (id) => request(`/vaccines/${id}/`),
  create:  (data) => request('/vaccines/', 'POST', data),
  update:  (id, data) => request(`/vaccines/${id}/`, 'PUT', data),
  delete:  (id) => request(`/vaccines/${id}/`, 'DELETE'),

  // ── Batches — flat FastAPI routes ─────────────────────────────────────────
  // GET all batches (optionally filter by vaccine_id client-side)
  getAllBatches: () => request('/batches/'),

  // POST /api/batches/ — payload must include vaccine_id
  addBatch: (vaccineId, data) =>
    request('/batches/', 'POST', { ...data, vaccine_id: vaccineId }),

  // PUT /api/batches/{id}/
  updateBatch: (batchId, data) =>
    request(`/batches/${batchId}/`, 'PUT', data),

  // DELETE /api/batches/{id}/
  deleteBatch: (batchId) =>
    request(`/batches/${batchId}/`, 'DELETE'),
};

// ── Vaccine Orders ────────────────────────────────────────────────────────────
export const orderAPI = {
  getAll:       ()         => request('/orders/'),
  create:       (data)     => request('/orders/', 'POST', data),
  updateStatus: (id, data) => request(`/orders/${id}/`, 'PATCH', data),
  delete:       (id)       => request(`/orders/${id}/`, 'DELETE'),
};

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const supplierAPI = {
  getAll:  ()         => request('/suppliers/'),
  create:  (data)     => request('/suppliers/', 'POST', data),
  update:  (id, data) => request(`/suppliers/${id}/`, 'PUT', data),
  delete:  (id)       => request(`/suppliers/${id}/`, 'DELETE'),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientAPI = {
  getAll: ()         => request('/patients/'),
  update: (id, data) => request(`/patients/${id}/`, 'PUT', data),
  delete: (id)       => request(`/patients/${id}/`, 'DELETE'),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const announcementAPI = {
  getAll:  ()         => request('/announcements/'),
  create:  (data)     => request('/announcements/', 'POST', data),
  update:  (id, data) => request(`/announcements/${id}/`, 'PUT', data),
  delete:  (id)       => request(`/announcements/${id}/`, 'DELETE'),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:      ()   => request('/notifications/'),
  markRead:    (id) => request(`/notifications/${id}/`, 'PATCH', { read: true }),
  markAllRead: ()   => request('/notifications/mark_all_read/', 'POST'),
  delete:      (id) => request(`/notifications/${id}/`, 'DELETE'),
  clearAll:    ()   => request('/notifications/clear_all/', 'DELETE'),
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