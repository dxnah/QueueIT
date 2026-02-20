// dashboardData.jsx

// ── ML PREDICTIONS ─────────────────────────────────────────
export const mlPredictions = {
  crowdLevelNormal: 'Normal - Medium',
  crowdLevelPeak:   'High - Above High',
  peakMonths:       'June - August',
  vaccinesAtNormal: 4000,
  vaccinesAtPeak:   6000,
};

// ── PREDICTION CARDS ───────────────────────────────────────
export const predictionCards = [
  { id: 1, label: 'Crowd Level (Normal)',  result: 'Normal - Medium',   confidence: 78, resultColor: '#f57f17' },
  { id: 2, label: 'Crowd Level (Peak)',    result: 'High - Above High', confidence: 91, resultColor: '#c62828' },
  { id: 3, label: 'Vaccine Demand',        result: 'High Demand',       confidence: 85, resultColor: '#c62828' },
  { id: 4, label: 'Stock Risk',            result: 'At Risk',           confidence: 88, resultColor: '#e53935' },
];

// ── ML INSIGHTS ────────────────────────────────────────────
export const mlInsights = [
  { id: 1, label: 'Task Priority',      result: 'Urgent' },
  { id: 2, label: 'System Health',      result: 'Stable' },
  { id: 3, label: 'Anomaly Detection',  result: 'None'   },
  { id: 4, label: 'Vaccine Risk Level', result: 'High'   },
  { id: 5, label: 'Restock Priority',   result: 'Urgent' },
];

// ── VACCINE DATA ───────────────────────────────────────────
export const vaccineData = [
  { id: 1, vaccine: 'Anti-Rabies',  available: 320, minStock: 300, mlRecommended: 200, status: 'In Stock'  },
  { id: 2, vaccine: 'Anti-Tetanus', available: 85,  minStock: 200, mlRecommended: 350, status: 'Low Stock' },
  { id: 3, vaccine: 'Booster',      available: 0,   minStock: 150, mlRecommended: 500, status: 'Out Stock' },
  { id: 4, vaccine: 'Hepatitis B',  available: 2,   minStock: 100, mlRecommended: 300, status: 'Low Stock' },
  { id: 5, vaccine: 'Flu Shot',     available: 150, minStock: 100, mlRecommended: 150, status: 'In Stock'  },
];