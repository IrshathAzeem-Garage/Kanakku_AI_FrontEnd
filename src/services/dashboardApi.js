import { api } from './api';

export const dashboardApi = {
  getSummary: async (dateStr) => {
    let url = '/dashboard/summary';
    if (dateStr) {
      url += `?date=${dateStr}`;
    }
    const res = await api.get(url);
    return res.data;
  },
};
