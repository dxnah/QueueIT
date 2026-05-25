const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://127.0.0.1:8000/api';
const CACHE_TTL = 30_000;
const SWR_TTL   = 60_000;

const cache = new Map();

// ── Token helpers ─────────────────────────────────────────────────────────────
export const tokenStorage = {
  get:   ()      => localStorage.getItem('access_token'),
  set:   (token) => localStorage.setItem('access_token', token),
  clear: ()      => localStorage.removeItem('access_token'),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function normKey(method, endpoint) {
  return `${method}:${endpoint.replace(/\/+$/, '')}`;
}

function invalidateKeys(...bases) {
  for (const key of cache.keys()) {
    if (bases.some(b => key.includes(b))) cache.delete(key);
  }
}

// ── Core request ──────────────────────────────────────────────────────────────
const request = async (endpoint, method = 'GET', body = null) => {
  const cacheKey = normKey(method, endpoint);

  if (method === 'GET' && cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    const age = Date.now() - timestamp;
    if (age < CACHE_TTL) return data;
    if (age < SWR_TTL) {
      doRequest(endpoint, method, body, cacheKey).catch(() => {});
      return data;
    }
  }

  return doRequest(endpoint, method, body, cacheKey);
};

async function doRequest(endpoint, method, body, cacheKey) {
  const controller = new AbortController();
  const isAuth = endpoint.includes('/login/') || endpoint.includes('/signup/');
  const timeout = setTimeout(() => controller.abort(), isAuth ? 2_000 : 8_000);

  const headers = { 'Content-Type': 'application/json' };

  // Attach JWT token for all non-auth endpoints
  if (!isAuth) {
    const token = tokenStorage.get();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers, signal: controller.signal };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    clearTimeout(timeout);

    // Auto-logout on 401
    if (response.status === 401) {
      tokenStorage.clear();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (response.status === 204) return null;

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || data?.error || `HTTP ${response.status}`);
    }

    if (method === 'GET') {
      cache.set(cacheKey, { data, timestamp: Date.now() });
    } else {
      const base = endpoint.split('/').filter(Boolean)[0];
      invalidateKeys(base);
      const relatedMap = {
        vaccines: ['batches', 'usage-reports', 'stock-reports'],
        batches:  ['vaccines'],
        patients: ['vaccination-history', 'dose-schedules', 'registrations'],
        orders:   ['stock-reports'],
      };
      invalidateKeys(...(relatedMap[base] ?? []));
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

export const requestMany = (endpoints) =>
  Promise.all(endpoints.map(ep => request(ep).catch(() => null)));

export const warmPatientPanel = (patientId) =>
  Promise.all([
    request(`/vaccination-history/patient/${patientId}/`),
    request(`/dose-schedules/patient/${patientId}/`),
    request(`/registrations/patient/${patientId}/`),
  ]).catch(() => {});

// ── Prefetch ──────────────────────────────────────────────────────────────────
export const prefetchAll = () =>
  Promise.all([
    request('/vaccines/'),
    request('/batches/'),
    request('/orders/'),
    request('/suppliers/'),
    request('/patients/'),
    request('/announcements/'),
    request('/notifications/'),
    request('/registrations/'),
    request('/usage-reports/'),
    request('/stock-reports/'),
  ]).catch(() => {});

// ── ML Forecast ───────────────────────────────────────────────────────────────
const ML_URL = process.env.REACT_APP_ML_URL || 'http://127.0.0.1:8000';

const mlRequest = async (endpoint, method = 'GET') => {
  const token = tokenStorage.get();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${ML_URL}${endpoint}`, { method, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const mlAPI = {
  getForecastByYear: (year)        => mlRequest(`/api/ml/forecast/year/${year}/`),
  getYearlySummary:  ()            => mlRequest('/api/ml/forecast/summary/'),
  getAvailableYears: ()            => mlRequest('/api/ml/forecast/years/'),
  getMetrics:        ()            => mlRequest('/api/ml/forecast/metrics/'),
  predict:           (year, month) => mlRequest(`/api/ml/predict/?year=${year}&month=${month}`, 'POST'),
  getCurrentMonth:   (year, month) => mlRequest(`/api/ml/forecast/?year=${year}&month=${month}`),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (username, password) => {
    const data = await request('/login/', 'POST', { username, password });
    if (data?.access_token) {
      tokenStorage.set(data.access_token);
    }
    return data;
  },
  register: (username, password, name) =>
    request('/signup/', 'POST', { username, password, name }),
  logout: () => {
    tokenStorage.clear();
    cache.clear();
    window.location.href = '/login';
  },
  isAuthenticated: () => !!tokenStorage.get(),
};

// ── Vaccines ──────────────────────────────────────────────────────────────────
export const vaccineAPI = {
  getAll:  ()         => request('/vaccines/'),
  getById: (id)       => request(`/vaccines/${id}/`),
  create:  (data)     => request('/vaccines/', 'POST', data),
  update:  (id, data) => request(`/vaccines/${id}/`, 'PUT', data),
  delete:  (id)       => request(`/vaccines/${id}/`, 'DELETE'),

  getAllBatches: ()          => request('/batches/'),
  addBatch:     (vid, data) => request('/batches/', 'POST', { ...data, vaccine_id: vid }),
  updateBatch:  (bid, data) => request(`/batches/${bid}/`, 'PUT', data),
  deleteBatch:  (bid)       => request(`/batches/${bid}/`, 'DELETE'),
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

// ── Vaccination History ───────────────────────────────────────────────────────
export const vaccinationHistoryAPI = {
  getByPatient: (pid)      => request(`/vaccination-history/patient/${pid}/`),
  create:       (data)     => request('/vaccination-history/', 'POST', data),
  update:       (id, data) => request(`/vaccination-history/${id}/`, 'PUT', data),
  delete:       (id)       => request(`/vaccination-history/${id}/`, 'DELETE'),
};

// ── Dose Schedules ────────────────────────────────────────────────────────────
export const doseScheduleAPI = {
  getByPatient: (pid)      => request(`/dose-schedules/patient/${pid}/`),
  create:       (data)     => request('/dose-schedules/', 'POST', data),
  update:       (id, data) => request(`/dose-schedules/${id}/`, 'PUT', data),
  delete:       (id)       => request(`/dose-schedules/${id}/`, 'DELETE'),
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

// ── Registrations ─────────────────────────────────────────────────────────────
export const registrationAPI = {
  getAll:       ()         => request('/registrations/'),
  getByPatient: (pid)      => request(`/registrations/patient/${pid}/`),
  create:       (data)     => request('/registrations/', 'POST', data),
  update:       (id, data) => request(`/registrations/${id}/`, 'PUT', data),
  delete:       (id)       => request(`/registrations/${id}/`, 'DELETE'),
};

// ── Stock Level Reports ───────────────────────────────────────────────────────
export const stockReportAPI = {
  getAll: ()         => request('/stock-reports/'),
  create: (data)     => request('/stock-reports/', 'POST', data),
  update: (id, data) => request(`/stock-reports/${id}/`, 'PUT', data),
  delete: (id)       => request(`/stock-reports/${id}/`, 'DELETE'),
};