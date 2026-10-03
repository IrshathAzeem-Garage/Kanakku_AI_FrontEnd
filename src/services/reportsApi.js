import { api } from './api';

export const reportsApi = {
  getDailyReport: async (targetDate) => {
    let url = '/reports/daily';
    if (targetDate) {
      url += `?target_date=${targetDate}`;
    }
    const res = await api.get(url);
    return res.data;
  },

  getWeeklyReport: async (endDate) => {
    let url = '/reports/weekly';
    if (endDate) {
      url += `?end_date=${endDate}`;
    }
    const res = await api.get(url);
    return res.data;
  },

  getMonthlyReport: async (year, month) => {
    let url = '/reports/monthly';
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    const res = await api.get(url);
    return res.data;
  },
};
