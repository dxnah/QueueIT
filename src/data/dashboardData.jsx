// dashboardData.js

// ── AUTHENTICATION DATA ───────────────────────────────────────────────────────
// Used by: Login.jsx, Settings.jsx
// Default admin credentials - can be updated via Settings page
export const authData = {
  defaultUsername: 'admin',
  defaultPassword: 'pass1',
};


// ── ML PREDICTIONS ────────────────────────────────────────────────────────────
// Used by: Dashboard.jsx (ML Vaccine Demand Forecast card)
export const mlPredictions = {
  peakMonths:       'June - August',
  vaccinesAtNormal: 4000,   // predicted total doses needed in a normal month
  vaccinesAtPeak:   6000,   // predicted total doses needed in a peak month
};


// ── ML INSIGHTS ───────────────────────────────────────────────────────────────
// Used by: Dashboard.jsx (ML Insights & System Status section)
export const mlInsights = [
  {
    category: '🔍 Anomaly Detection',
    items: [
      {
        id: 'a1',
        label: 'Unusual dispensing spike',
        note: 'Anti-Rabies dispensing +42% above normal this week',
        status: 'warning',
      },
      {
        id: 'a2',
        label: 'Batch expiry risk',
        note: 'Hepatitis B Batch HB-2024-004 expires in 30 days',
        status: 'warning',
      },
      {
        id: 'a3',
        label: 'Zero-stock anomaly',
        note: 'Booster has been out of stock for 3+ consecutive days',
        status: 'critical',
      },
    ],
  },
  {
    category: '🖥️ System Health',
    items: [
      {
        id: 's1',
        label: 'ML Model Accuracy',
        note: 'Prediction model running at 91% confidence',
        status: 'ok',
      },
      {
        id: 's2',
        label: 'Data Sync',
        note: 'Last synced 2 minutes ago — all records up to date',
        status: 'ok',
      },
      {
        id: 's3',
        label: 'Scheduled Maintenance',
        note: 'Planned downtime Feb 25, 2:00 AM – 4:00 AM',
        status: 'warning',
      },
    ],
  },
  {
    category: '💉 Restock Priority',
    items: [
      {
        id: 'r1',
        label: 'Order Booster now',
        note: 'ML recommends 500 doses — currently out of stock',
        status: 'critical',
      },
      {
        id: 'r2',
        label: 'Order Hepatitis B soon',
        note: 'ML recommends 300 doses — only 2 doses remaining',
        status: 'critical',
      },
      {
        id: 'r3',
        label: 'Monitor Anti-Tetanus',
        note: 'Consider ordering 350 doses within this week',
        status: 'warning',
      },
    ],
  },
];


// ── VACCINE DATA ──────────────────────────────────────────────────────────────
// Used by: Dashboard.jsx, DailyAnalytics.jsx, VaccineManagement.jsx
export const vaccineData = [
  {
    id:            1,
    vaccine:       'Anti-Rabies',
    available:     320,
    minStock:      300,
    mlRecommended: 200,
    status:        'In Stock',
    batchNumber:   'AR-2024-001',
    expiryDate:    '2029-06-15',
  },
  {
    id:            2,
    vaccine:       'Anti-Tetanus',
    available:     85,
    minStock:      200,
    mlRecommended: 350,
    status:        'Low Stock',
    batchNumber:   'AT-2024-002',
    expiryDate:    '2029-08-20',
  },
  {
    id:            3,
    vaccine:       'Booster',
    available:     0,
    minStock:      150,
    mlRecommended: 500,
    status:        'Out Stock',
    batchNumber:   'BS-2024-003',
    expiryDate:    '2029-04-10',
  },
  {
    id:            4,
    vaccine:       'Hepatitis B',
    available:     2,
    minStock:      100,
    mlRecommended: 300,
    status:        'Low Stock',
    batchNumber:   'HB-2024-004',
    expiryDate:    '2029-07-25',
  },
  {
    id:            5,
    vaccine:       'Flu Shot',
    available:     21,
    minStock:      100,
    mlRecommended: 150,
    status:        'In Stock',
    batchNumber:   'FL-2024-005',
    expiryDate:    '2029-05-30',
  },
];


// ── VACCINE COLORS ────────────────────────────────────────────────────────────
// Used by: DailyAnalytics.jsx (chart colors)
export const vaccineColors = {
  'Anti-Rabies':  '#26a69a',
  'Anti-Tetanus': '#f57f17',
  'Booster':      '#e53935',
  'Hepatitis B':  '#5c6bc0',
  'Flu Shot':     '#2e7d32',
};

export const vaccineColorList = [
  '#26a69a',
  '#f57f17',
  '#e53935',
  '#5c6bc0',
  '#2e7d32',
];


// ── REPORTS DATA ──────────────────────────────────────────────────────────────
// Used by: Reports.jsx
export const reportsData = {
  'vaccine-usage': [
    { vaccine: 'Anti-Rabies',  administered: 450, wasted: 12, remaining: 320 },
    { vaccine: 'Anti-Tetanus', administered: 280, wasted: 5,  remaining: 85  },
    { vaccine: 'Booster',      administered: 150, wasted: 0,  remaining: 0   },
    { vaccine: 'Hepatitis B',  administered: 98,  wasted: 3,  remaining: 2   },
    { vaccine: 'Flu Shot',     administered: 120, wasted: 8,  remaining: 150 },
  ],
  'stock-levels': [
    { date: 'Week 1', inStock: 800, lowStock: 2, outStock: 0 },
    { date: 'Week 2', inStock: 650, lowStock: 3, outStock: 1 },
    { date: 'Week 3', inStock: 550, lowStock: 3, outStock: 1 },
    { date: 'Week 4', inStock: 480, lowStock: 4, outStock: 1 },
  ],
};


// ── NOTIFICATIONS DATA ────────────────────────────────────────────────────────
// Used by: Notifications.jsx
export const notificationsData = [
  {
    id:      1,
    type:    'critical',
    title:   'Booster Vaccine Out of Stock',
    message: 'Immediate restocking required for Booster vaccine.',
    time:    '5 minutes ago',
    read:    false,
  },
  {
    id:      2,
    type:    'warning',
    title:   'Low Stock Alert',
    message: 'Anti-Tetanus vaccine is running low (85 doses remaining).',
    time:    '1 hour ago',
    read:    false,
  },
  {
    id:      3,
    type:    'info',
    title:   'ML Prediction Update',
    message: 'Peak demand expected June–August. Recommended stock: 6,000 doses.',
    time:    '2 hours ago',
    read:    false,
  },
  {
    id:      4,
    type:    'success',
    title:   'Restock Completed',
    message: 'Anti-Rabies vaccine restocked successfully (500 doses added).',
    time:    '5 hours ago',
    read:    true,
  },
  {
    id:      5,
    type:    'warning',
    title:   'Expiring Soon',
    message: 'Hepatitis B vaccine (Batch HB-2024-004) expires in 30 days.',
    time:    '1 day ago',
    read:    true,
  },
  {
    id:      6,
    type:    'info',
    title:   'System Maintenance',
    message: 'Scheduled maintenance on Feb 25, 2025 from 2:00 AM - 4:00 AM.',
    time:    '2 days ago',
    read:    true,
  },
];