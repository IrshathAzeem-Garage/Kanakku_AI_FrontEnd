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

  // PDF & Email Delivery Methods
  getPdfBlob: async (id, download = false) => {
    const res = await api.get(`/records/${id}/pdf${download ? '?download=true' : ''}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  viewPdfInNewTab: async (id) => {
    const blob = await recordsApi.getPdfBlob(id, false);
    const fileUrl = URL.createObjectURL(blob);
    window.open(fileUrl, '_blank');
  },

  downloadPdf: async (id, fallbackFilename = `Daily_Report_${id}.pdf`) => {
    const blob = await recordsApi.getPdfBlob(id, true);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fallbackFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  generatePdf: async (id) => {
    const res = await api.post(`/records/${id}/pdf`);
    return res.data;
  },

  sendReportEmail: async (id) => {
    const res = await api.post(`/records/${id}/email`);
    return res.data;
  },

  // Retained alias for backwards-compatibility
  sendToWhatsapp: async (id) => {
    const res = await api.post(`/records/${id}/email`);
    return res.data;
  },

  getDeliveryStatus: async (id) => {
    const res = await api.get(`/records/${id}/delivery-status`);
    return res.data;
  },
};
