// Access token is stored in-memory only — never in localStorage/sessionStorage.
// The refresh token is stored as an httpOnly cookie managed by the server.
let _accessToken = null;

export function setTokens({ accessToken }) {
  _accessToken = accessToken || null;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearTokens() {
  _accessToken = null;
}

const storageService = { setTokens, getAccessToken, clearTokens };
export default storageService;
