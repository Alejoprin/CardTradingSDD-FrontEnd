import api from './api';

const tradeService = {
  async listTrades(params = {}) {
    const response = await api.get('/trades', { params });
    return response.data;
  },

  async createTrade(body) {
    const response = await api.post('/trades', body);
    return response.data;
  },

  async getTrade(tradeId) {
    const response = await api.get(`/trades/${tradeId}`);
    return response.data;
  },

  async acceptTrade(tradeId) {
    const response = await api.put(`/trades/${tradeId}/accept`);
    return response.data;
  },

  async rejectTrade(tradeId, body = {}) {
    const response = await api.put(`/trades/${tradeId}/reject`, body);
    return response.data;
  },

  async cancelTrade(tradeId) {
    await api.delete(`/trades/${tradeId}`);
  },
};

export default tradeService;
