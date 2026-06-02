import api from './api';

const chatService = {
  async createChat(adId) {
    const response = await api.post('/chats', { adId });
    return response.data;
  },

  async listChats(params = {}) {
    const response = await api.get('/chats', { params });
    return response.data;
  },

  async getChat(chatId) {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  async getMessages(chatId, params = {}) {
    const response = await api.get(`/chats/${chatId}/messages`, { params });
    return response.data;
  },

  async sendMessage(chatId, body) {
    const response = await api.post(`/chats/${chatId}/messages`, body);
    return response.data;
  },

  getWebSocketUrl(token) {
    const base = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws';
    return `${base}/chat?token=${token}`;
  },
};

export default chatService;
