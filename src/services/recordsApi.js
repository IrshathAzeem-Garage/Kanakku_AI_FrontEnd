import { api } from './api';

export const recordsApi = {
  analyzeImage: async (imageFile, requestId) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const reqParam = requestId ? `?request_id=${requestId}` : '';
    const res = await api.post(`/records/analyze${reqParam}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Cache-Control': 'no-cache',
      },
    });
    return res.data;
  },

  createRecord: async (recordData) => {
    const res = await api.post('/records', recordData);
    return res.data;
  },

  getRecords: async ({ record_date, limit = 50, offset = 0 } = {}) => {
    let url = `/records?limit=${limit}&offset=${offset}`;
    if (record_date) {
      url += `&record_date=${record_date}`;
    }
    const res = await api.get(url);
    return res.data;
  },

  getRecordById: async (id) => {
    const res = await api.get(`/records/${id}`);
    return res.data;
  },

  updateRecord: async (id, updateData) => {
    const res = await api.put(`/records/${id}`, updateData);
    return res.data;
  },

  deleteRecord: async (id) => {
    const res = await api.delete(`/records/${id}`);
    return res.data;
  },
};
