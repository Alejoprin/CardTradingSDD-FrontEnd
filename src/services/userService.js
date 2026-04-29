import api from './api';

const userService = {
  async getUserProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async updateUserProfile(userId, body) {
    const response = await api.put(`/users/${userId}`, body);
    return response.data;
  },
};

export default userService;
