import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email, username, password) {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async refresh() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  async requestPasswordReset(email) {
    const response = await api.post('/auth/password/reset', { email });
    return response.data;
  },

  async confirmPasswordReset(token, newPassword) {
    const response = await api.post('/auth/password/reset/confirm', { token, newPassword });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/password/change', { currentPassword, newPassword });
    return response.data;
  },
};

export default authService;
