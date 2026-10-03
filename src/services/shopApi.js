import { api } from './api';

export const shopApi = {
  getShop: async () => {
    const res = await api.get('/shop');
    return res.data;
  },

  updateShop: async (shopData) => {
    const res = await api.put('/shop', shopData);
    return res.data;
  },
};
