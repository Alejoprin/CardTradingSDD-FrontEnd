import api from './api';

const userService = {
  async getUserProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async getActivityFeed(userId) {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  },

  // Added in T076 (Phase 12)
  async updateUserProfile(userId, formData) {
    const response = await api.put(`/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userService;
