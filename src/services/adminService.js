import api from './api';

const adminService = {
  async getStats(params = {}) {
    const response = await api.get('/admin/stats', { params });
    return response.data;
  },

  async listUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async banUser(userId, body) {
    const response = await api.put(`/admin/users/${userId}/ban`, body);
    return response.data;
  },

  async listAllTrades(params = {}) {
    const response = await api.get('/admin/trades', { params });
    return response.data;
  },
};

export default adminService;
