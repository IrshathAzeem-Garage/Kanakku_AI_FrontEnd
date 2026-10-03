import { api } from './api';

export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', {
      username: username.trim(),
      password,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },
};
