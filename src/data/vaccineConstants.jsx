// src/data/vaccineConstants.js

export const SUPPLIERS_LIST = [
  'MedSource Philippines',
  'VaccinePro Asia',
  'GlobalHealth Supply Co.',
  'PhilMed Distribution',
  'BioLogic Partners',
];

export const PRICE_PER_DOSE = 1100;

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const DAYS_IN_MONTH = {
  January:31, February:28, March:31,  April:30,
  May:31,     June:30,     July:31,   August:31,
  September:30, October:31, November:30, December:31,
};

export const MONTH_START_DAYS = {
  January:0, February:3, March:3,  April:6,
  May:1,     June:4,     July:6,   August:2,
  September:5, October:0, November:3, December:5,
};

export const INITIAL_BATCH_DATA = {
  'Anti-Rabies': [
    {
      id: 1,
      batchNumber:   'AR-2025-005',
      expiryDate:    '2029-06-15',
      available:     320,
      used:          60,
      datePurchased: '2025-07-27',
      supplier:      'MedSource Philippines',
      mlRecommended: 200,
    },
  ],
  'Booster': [
    {
      id: 1,
      batchNumber:   'BST-2025-001',
      expiryDate:    '2029-06-15',
      available:     0,
      used:          60,
      datePurchased: '2025-07-27',
      supplier:      'VaccinePro Asia',
      mlRecommended: 500,
    },
  ],
};