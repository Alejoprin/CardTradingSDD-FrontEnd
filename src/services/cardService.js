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

  // T053 — Delete card (catalog, ADMIN only)
  async deleteCard(cardId) {
    await api.delete(`/cards/${cardId}`);
  },

  // Inventory management
  async addToInventory(userId, body) {
    const response = await api.post(`/users/${userId}/inventory`, body);
    return response.data;
  },

  async addCustomToInventory(userId, formData) {
    const response = await api.post(`/users/${userId}/inventory/custom`, formData);
    return response.data;
  },

  async removeFromInventory(userId, userCardId) {
    await api.delete(`/users/${userId}/inventory/${userCardId}`);
  },

  // Search cards by name (for trade builder autocomplete)
  async searchCards(search, params = {}) {
    const response = await api.get('/cards', { params: { search, size: 10, ...params } });
    return response.data;
  },

  // Get users who own a specific card
  async getCardOwners(cardId) {
    const response = await api.get(`/cards/${cardId}/owners`);
    return response.data;
  },

  async updateCardQuantity(userId, userCardId, quantity) {
    const response = await api.patch(`/users/${userId}/inventory/${userCardId}`, { quantity });
    return response.data;
  },
};

export default cardService;
