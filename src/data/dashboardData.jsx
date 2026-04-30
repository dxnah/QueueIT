export const PEAK_MONTHS = ['June', 'July', 'August'];

export const generateForecastData = (vaccineList = [], month = 'January') => {
  const PEAK_MONTHS = ['June', 'July', 'August'];
  const monthMult = PEAK_MONTHS.includes(month) ? 1.55 : 1.0;

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