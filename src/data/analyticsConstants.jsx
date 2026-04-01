export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  
  export const PEAK_MONTHS = ['June', 'July', 'August'];
  
  export const DAYS_IN_MONTH = {
    January: 31, February: 28, March: 31,  April: 30,
    May: 31,     June: 30,     July: 31,   August: 31,
    September: 30, October: 31, November: 30, December: 31,
  };
  
  export const MONTH_START_DAYS = {
    January: 0, February: 3, March: 3,  April: 6,
    May: 1,     June: 4,     July: 6,   August: 2,
    September: 5, October: 0, November: 3, December: 5,
  };
  
  
  export const VACCINE_COLORS = {
    'Anti-Rabies': '#26a69a',
    'Anti-Tetanus': '#f57f17',
    'Booster': '#e53935',
    'Hepatitis B': '#5c6bc0',
    'Flu Shot': '#2e7d32',
  };
  
  
  export const CHART_COLORS = ['#26a69a', '#f57f17', '#e53935', '#5c6bc0', '#2e7d32'];
  
 
  export const PEAK_MULTIPLIER = 1.55;
  
  
  export const getMonthMultiplier = (month) =>
    PEAK_MONTHS.includes(month) ? PEAK_MULTIPLIER : 1.0;