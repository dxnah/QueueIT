// src/data/mockHistory.js

export const MOCK_VACCINATION_HISTORY = {
  1: [
    { id: 1, vaccine: 'Anti-Rabies', date_administered: '2025-01-15', administered_by: 'Dr. Santos', notes: 'No adverse reactions.' },
    { id: 2, vaccine: 'Booster',     date_administered: '2025-03-10', administered_by: 'Dr. Reyes',  notes: 'Patient tolerated well.' },
  ],
  2: [
    { id: 3, vaccine: 'Hepatitis B', date_administered: '2025-02-20', administered_by: 'Dr. Santos', notes: 'First dose.' },
  ],
  3: [],
  4: [
    { id: 4, vaccine: 'Anti-Rabies', date_administered: '2024-12-05', administered_by: 'Dr. Cruz',   notes: 'Annual booster.' },
    { id: 5, vaccine: 'Flu Shot',    date_administered: '2025-01-20', administered_by: 'Dr. Santos', notes: 'Seasonal flu shot.' },
    { id: 6, vaccine: 'Booster',     date_administered: '2025-03-01', administered_by: 'Dr. Reyes',  notes: 'Completed series.' },
  ],
  5: [
    { id: 7, vaccine: 'Hepatitis B', date_administered: '2025-02-14', administered_by: 'Dr. Cruz',   notes: 'Second dose.' },
  ],
};

export const MOCK_SCHEDULES = {
  1: [
    { id: 1, vaccine: 'Booster',     scheduled_date: '2025-06-15', status: 'scheduled', notes: 'Follow-up dose.' },
    { id: 2, vaccine: 'Anti-Rabies', scheduled_date: '2025-08-01', status: 'scheduled', notes: 'Annual booster.' },
  ],
  2: [
    { id: 3, vaccine: 'Hepatitis B', scheduled_date: '2025-05-20', status: 'scheduled', notes: 'Second dose.' },
    { id: 4, vaccine: 'Hepatitis B', scheduled_date: '2025-05-10', status: 'completed', notes: 'Completed on time.' },
  ],
  3: [],
  4: [
    { id: 5, vaccine: 'Flu Shot',    scheduled_date: '2025-07-10', status: 'scheduled', notes: 'Annual flu vaccine.' },
  ],
  5: [
    { id: 6, vaccine: 'Hepatitis B', scheduled_date: '2025-04-28', status: 'cancelled', notes: 'Patient rescheduled.' },
    { id: 7, vaccine: 'Booster',     scheduled_date: '2025-06-05', status: 'scheduled', notes: 'Due for booster.' },
  ],
};