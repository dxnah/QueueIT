export const PEAK_MONTHS = ['January', 'February', 'March'];

export const MODEL_SEASONAL_MULTIPLIERS = {
  1: 1.0946,  // Jan
  2: 1.0963,  // Feb
  3: 1.1182,  // Mar
  4: 0.9656,  // Apr
  5: 0.9277,  // May
  6: 0.9372,  // Jun
  7: 0.8928,  // Jul
  8: 0.9041,  // Aug
  9: 1.0307,  // Sep
  10: 1.0401, // Oct
  11: 0.9620, // Nov
  12: 1.0307, // Dec
};

export const generateForecastData = (vaccineList = [], month = 'January') => {
  const monthMult = PEAK_MONTHS.includes(month) ? 1.35 : 1.0;

  return vaccineList.map((v) => {
    const neededBase = Math.round((v.mlRecommended || 0) * monthMult);
    const peakNeed   = Math.round(neededBase * 1.5);
    const divisor    = 30;
    const weeksLeft  = v.available > 0 && neededBase > 0
      ? parseFloat((v.available / (neededBase / divisor)).toFixed(1))
      : 0;

    let status, action;
    if (v.available === 0) {
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

export const authData = {
  defaultUsername: '',
  defaultPassword: '',
  defaultEmail: '',
};