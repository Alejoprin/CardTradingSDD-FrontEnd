import api from './api';

const cardService = {
  // T041 — Create card
  async createCard(formData) {
    const response = await api.post('/cards', formData);
    return response.data;
  },

  // T045 — Get user inventory
  async getUserInventory(userId, params = {}) {
    const response = await api.get(`/users/${userId}/inventory`, { params });
    return response.data;
  },

  // T050 — List all cards (catalog)
  async listCards(params = {}) {
    const response = await api.get('/cards', { params });
    return response.data;
  },

  // T053 — Get single card
  async getCard(cardId) {
    const response = await api.get(`/cards/${cardId}`);
    return response.data;
  },

  // T053 — Update card
  async updateCard(cardId, formData) {
    const response = await api.put(`/cards/${cardId}`, formData);
    return response.data;
  },

  // T053 — Delete card
  async deleteCard(cardId) {
    await api.delete(`/cards/${cardId}`);
  },
};

export default cardService;
