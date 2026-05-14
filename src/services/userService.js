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

  async uploadProfileImage(userId, file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/users/${userId}/profile-image`, formData);
    return response.data;
  },
};

export default userService;
