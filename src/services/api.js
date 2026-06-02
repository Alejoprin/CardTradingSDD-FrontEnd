import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getAccessToken, setTokens, clearTokens } from './storageService';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// Allows AuthContext to register the logout callback after it mounts,
// breaking the circular import that would occur if we imported AuthContext here.
let _logoutCallback = null;
export function setLogoutCallback(cb) {
  _logoutCallback = cb;
}

// T031 — Request interceptor: attach Bearer token + set Content-Type for JSON requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json; charset=utf-8';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// T032 — Response interceptor: silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = refreshResponse.data;
        setTokens({ accessToken });
        original.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        clearTokens();
        if (_logoutCallback) _logoutCallback();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
