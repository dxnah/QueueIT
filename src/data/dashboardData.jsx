// ─── AUTHENTICATION DATA ───────────────────────────────────────────────────────
export const authData = {
  defaultUsername: 'admin',
  defaultPassword: 'pass1',
  defaultEmail: 'admin@vaxflow.com',
};

// ─── ML PREDICTIONS ───────────────────────────────────────────────────────────
export const mlPredictions = {
  peakMonths:       'June - August',
  vaccinesAtNormal: 2500,
  vaccinesAtPeak:   3800,
};

// ─── ML INSIGHTS ──────────────────────────────────────────────────────────────
export const mlInsights = [
  {
    category: '🔍 Anomaly Detection',
    items: [
      { id: 'a1', label: 'Unusual dispensing spike',   note: 'Anti-Rabies dispensing +42% above normal this week',      status: 'warning'  },
      { id: 'a2', label: 'Zero-stock anomaly',         note: 'Booster has been out of stock for 3+ consecutive days',    status: 'critical' },
      { id: 'a3', label: 'Batch expiry approaching',   note: 'Anti-Rabies Batch AR-2024-001 expires in 2029 — monitor', status: 'ok'       },
    ],
  },
  {
    category: '🖥️ System Health',
    items: [
      { id: 's1', label: 'ML Model Accuracy',     note: 'Prediction model running at 91% confidence',         status: 'ok'      },
      { id: 's2', label: 'Data Sync',             note: 'Last synced 2 minutes ago — all records up to date', status: 'ok'      },
      { id: 's3', label: 'Scheduled Maintenance', note: 'Planned downtime Feb 25, 2:00 AM – 4:00 AM',        status: 'warning' },
    ],
  },
  {
    category: '💉 Restock Priority',
    items: [
      { id: 'r1', label: 'Order Booster now',        note: 'ML recommends 500 doses — currently out of stock',  status: 'critical' },
      { id: 'r2', label: 'Monitor Anti-Rabies stock', note: 'Stock is sufficient but peak season is approaching', status: 'warning'  },
    ],
  },
];

// ─── VACCINE DATA ──────────────────────────────────────────────────────────────
export const vaccineData = [
  { id: 1, vaccine: 'Anti-Rabies', available: 320, minStock: 300, mlRecommended: 200, status: 'In Stock',  batchNumber: 'AR-2024-001', expiryDate: '2029-06-15' },
  { id: 2, vaccine: 'Booster',     available: 0,   minStock: 150, mlRecommended: 500, status: 'Out Stock', batchNumber: 'BS-2024-003', expiryDate: '2029-04-10' },
];

// ─── VACCINE COLORS ────────────────────────────────────────────────────────────
export const vaccineColors = {
  'Anti-Rabies': '#26a69a',
  'Booster':     '#e53935',
};

export const vaccineColorList = ['#26a69a', '#e53935'];

// ─── PEAK MONTHS & MONTHLY REQUIREMENTS ───────────────────────────────────────
export const PEAK_MONTHS = ['June', 'July', 'August'];

export const MONTHLY_REQUIREMENTS = {
  'Anti-Rabies': 4000,
  'Booster':     3000,
};

export const getMonthlyRequirement = (vaccineName, month) => {
  const base = MONTHLY_REQUIREMENTS[vaccineName] ?? 0;
  return PEAK_MONTHS.includes(month) ? Math.round(base * 1.5) : base;
};

export const getMonthMultiplier = (month) =>
  PEAK_MONTHS.includes(month) ? 1.55 : 1.0;

export const generateForecastData = (month, weekIndex = null, day = null) => {
  const monthMult = getMonthMultiplier(month);
  const weekMult  = weekIndex !== null ? (1 + weekIndex * 0.05) : 1;
  const dayMult   = day !== null ? (1 / 30) : weekIndex !== null ? (1 / 4) : 1;

  return vaccineData.map((v) => {
    const baseAvail  = v.available;
    const neededBase = Math.round(v.mlRecommended * monthMult * weekMult * dayMult);
    const peakNeed   = Math.round(neededBase * 1.5);
    const divisor    = day ? 1 : weekIndex !== null ? 7 : 30;
    const weeksLeft  = baseAvail > 0
      ? parseFloat((baseAvail / (neededBase / divisor)).toFixed(1))
      : 0;

    let status, action;
    if (baseAvail === 0) {
      status = '🚨 No stock — order immediately';
      action = 'order_now';
    } else if (weeksLeft < 1.5) {
      status = `⚠️ About ${weeksLeft} week left — order soon`;
      action = 'order_soon';
    } else if (weeksLeft < 3) {
      status = `⚠️ Less than ${weeksLeft} wks left`;
      action = 'order_soon';
    } else {
      status = `✅ Good for ${weeksLeft} more weeks`;
      action = 'ok';
    }

    return { ...v, neededBase, peakNeed, weeksLeft, status, action };
  });
};

export const dailyUsageLog = {};

export const getUsedThisMonth = (vaccineName, month) => {
  const monthLog = dailyUsageLog[month];
  if (!monthLog) return 0;
  const vLog = monthLog[vaccineName];
  if (!vLog) return 0;
  return Object.values(vLog).reduce((sum, v) => sum + v, 0);
};

export const logDailyUsage = (vaccineName, month, day, amount) => {
  if (!dailyUsageLog[month]) dailyUsageLog[month] = {};
  if (!dailyUsageLog[month][vaccineName]) dailyUsageLog[month][vaccineName] = {};
  dailyUsageLog[month][vaccineName][day] = amount;
};

export const getOrderUrgency = (remaining, required) => {
  if (required === 0) return 'normal';
  const pct = remaining / required;
  if (pct <= 0.15) return 'urgent';
  if (pct <= 0.40) return 'soon';
  return 'normal';
};

export const reportsData = {
  'vaccine-usage': [
    { vaccine: 'Anti-Rabies', administered: 450, wasted: 12, remaining: 320 },
    { vaccine: 'Booster',     administered: 150, wasted: 0,  remaining: 0   },
  ],
  'stock-levels': [
    { date: 'Week 1', inStock: 320, lowStock: 0, outStock: 1 },
    { date: 'Week 2', inStock: 280, lowStock: 0, outStock: 1 },
    { date: 'Week 3', inStock: 240, lowStock: 0, outStock: 1 },
    { date: 'Week 4', inStock: 200, lowStock: 1, outStock: 1 },
  ],
};

export const notificationsData = [
  { id: 1, type: 'critical', title: 'Booster Vaccine Out of Stock',  message: 'Immediate restocking required for Booster vaccine.',                       time: '5 minutes ago', read: false },
  { id: 2, type: 'warning',  title: 'Anti-Rabies Stock Monitor',     message: 'Anti-Rabies is at 320 doses. Peak season approaching — plan restock.',     time: '1 hour ago',    read: false },
  { id: 3, type: 'info',     title: 'ML Prediction Update',          message: 'Peak demand expected June–August. Recommended total stock: 3,800 doses.',  time: '2 hours ago',   read: false },
  { id: 4, type: 'success',  title: 'Restock Completed',             message: 'Anti-Rabies vaccine restocked successfully (500 doses added).',            time: '5 hours ago',   read: true  },
  { id: 5, type: 'warning',  title: 'Booster Still Out of Stock',    message: 'Booster vaccine has been out of stock for 3 consecutive days.',            time: '1 day ago',     read: true  },
  { id: 6, type: 'info',     title: 'System Maintenance',            message: 'Scheduled maintenance on Feb 25, 2025 from 2:00 AM - 4:00 AM.',           time: '2 days ago',    read: true  },
];

export const usersData = [
  { id: 1, name: 'Maria Santos',   email: 'maria.santos@gmail.com',   phone: '09171234567', username: 'maria.santos',   password: 'Maria@2024',  status: 'Active',   lastLogin: '2025-03-15T08:32:00', avatar: 'MS', queueNumber: 'Q-001' },
  { id: 2, name: 'Juan dela Cruz', email: 'juan.delacruz@gmail.com',  phone: '09281234567', username: 'juan.delacruz',  password: 'Juan@2024',   status: 'Active',   lastLogin: '2025-03-14T14:10:00', avatar: 'JD', queueNumber: 'Q-002' },
  { id: 3, name: 'Ana Reyes',      email: 'ana.reyes@gmail.com',      phone: '09391234567', username: 'ana.reyes',      password: 'Ana@2024',    status: 'Inactive', lastLogin: '2025-02-28T09:55:00', avatar: 'AR', queueNumber: 'Q-003' },
  { id: 4, name: 'Carlos Mendoza', email: 'carlos.mendoza@gmail.com', phone: '09451234567', username: 'carlos.mendoza', password: 'Carlos@2024', status: 'Active',   lastLogin: '2025-03-16T07:45:00', avatar: 'CM', queueNumber: 'Q-004' },
  { id: 5, name: 'Rosa Bautista',  email: 'rosa.bautista@gmail.com',  phone: '09561234567', username: 'rosa.bautista',  password: 'Rosa@2024',   status: 'Active',   lastLogin: '2025-03-13T11:20:00', avatar: 'RB', queueNumber: 'Q-005' },
];

export const mobileRegistrationsData = [
  { queueNumber: 'Q-001', fullName: 'Maria Santos',   age: 30, birthdate: '1995-03-15', address: 'Cagayan de Oro City', contactNumber: '09171234567', dateOfIncident: '2026-04-01', typeOfInjury: 'Bitten',    animalInvolved: 'Dog', animalOwner: 'Neighbor',   animalVaccinated: 'Yes', bodyPartsAffected: 'Left Arm'   },
  { queueNumber: 'Q-002', fullName: 'Juan dela Cruz', age: 45, birthdate: '1980-06-20', address: 'Lapasan, CDO',         contactNumber: '09281234567', dateOfIncident: '2026-04-01', typeOfInjury: 'Scratched', animalInvolved: 'Cat', animalOwner: 'Family pet', animalVaccinated: 'No',  bodyPartsAffected: 'Right Hand' },
  { queueNumber: 'Q-003', fullName: 'Ana Reyes',      age: 26, birthdate: '2000-01-02', address: 'Carmen, CDO',          contactNumber: '09391234567', dateOfIncident: '2026-04-01', typeOfInjury: 'Bitten',    animalInvolved: 'Cat', animalOwner: 'Family pet', animalVaccinated: 'Yes', bodyPartsAffected: 'Hands'      },
  { queueNumber: 'Q-004', fullName: 'Carlos Mendoza', age: 38, birthdate: '1988-09-10', address: 'Nazareth, CDO',        contactNumber: '09451234567', dateOfIncident: '2026-03-30', typeOfInjury: 'Bitten',    animalInvolved: 'Dog', animalOwner: 'Stray',      animalVaccinated: 'No',  bodyPartsAffected: 'Left Leg'   },
  { queueNumber: 'Q-005', fullName: 'Rosa Bautista',  age: 52, birthdate: '1973-11-25', address: 'Macabalan, CDO',       contactNumber: '09561234567', dateOfIncident: '2026-03-31', typeOfInjury: 'Scratched', animalInvolved: 'Dog', animalOwner: 'Neighbor',   animalVaccinated: 'Yes', bodyPartsAffected: 'Right Arm'  },
];

export const suppliersData = [
  { id: 1, name: 'MedSource Philippines',   contact: 'info@medsource.ph',       phone: '+63 2 8234 5678', address: '123 Bonifacio St., Makati City, Metro Manila', vaccines: ['Anti-Rabies', 'Flu Shot'],     status: 'Active',   leadTimeDays: 5,  notes: 'Preferred supplier for ARV. Offers bulk discounts above 500 doses.' },
  { id: 2, name: 'VaccinePro Asia',         contact: 'orders@vaccinepro.com.ph', phone: '+63 32 412 9000', address: '45 Osmeña Blvd., Cebu City',                  vaccines: ['Booster', 'Hepatitis B'],      status: 'Active',   leadTimeDays: 7,  notes: 'Handles Booster and Hep B supply for Visayas region.' },
  { id: 3, name: 'GlobalHealth Supply Co.', contact: 'ph@globalhealth.com',      phone: '+63 2 8900 1122', address: '88 Ayala Ave., Makati City, Metro Manila',     vaccines: ['Anti-Tetanus', 'Flu Shot'],    status: 'Active',   leadTimeDays: 10, notes: 'International supplier. Good for large volume orders.' },
  { id: 4, name: 'PhilMed Distribution',    contact: 'supply@philmed.ph',        phone: '+63 82 221 3344', address: '10 Ilustre St., Davao City',                   vaccines: ['Anti-Rabies', 'Anti-Tetanus'], status: 'Inactive', leadTimeDays: 14, notes: 'Currently on hold. Contact before placing orders.' },
  { id: 5, name: 'BioLogic Partners',       contact: 'hello@biologicph.com',     phone: '+63 2 7789 0055', address: '22 Rizal Ave., Quezon City, Metro Manila',     vaccines: ['Hepatitis B', 'Booster'],      status: 'Active',   leadTimeDays: 6,  notes: 'Specializes in cold-chain logistics. Reliable for perishable stock.' },
];