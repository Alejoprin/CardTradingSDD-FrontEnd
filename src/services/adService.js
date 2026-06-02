import api from './api';

const adService = {
  async listAds(params = {}) {
    const response = await api.get('/ads', { params });
    return response.data;
  },

  async getAd(adId) {
    const response = await api.get(`/ads/${adId}`);
    return response.data;
  },

  async createAd(body) {
    const response = await api.post('/ads', body);
    return response.data;
  },

  async updateAd(adId, body) {
    const response = await api.put(`/ads/${adId}`, body);
    return response.data;
  },

  async closeAd(adId) {
    await api.delete(`/ads/${adId}`);
  },

  async getUserAds(userId, params = {}) {
    const response = await api.get(`/users/${userId}/ads`, { params });
    return response.data;
  },
};

export default adService;
