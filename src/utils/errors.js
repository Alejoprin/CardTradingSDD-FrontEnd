export class AppError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'AppError';
    this.code = code || 'UNKNOWN_ERROR';
    this.status = status || 0;
  }
}

export function parseApiError(error) {
  if (!error) return new AppError('An unexpected error occurred');

  if (error.response) {
    const { status, data } = error.response;
    const message = data?.error || data?.message || getDefaultMessageForStatus(status);
    return new AppError(message, data?.code, status);
  }

  if (error.request) {
    return new AppError('Network error — please check your connection', 'NETWORK_ERROR');
  }

  return new AppError(error.message || 'An unexpected error occurred', 'CLIENT_ERROR');
}

function getDefaultMessageForStatus(status) {
  switch (status) {
    case 400: return 'Invalid request';
    case 401: return 'Authentication required';
    case 403: return 'Access denied';
    case 404: return 'Resource not found';
    case 409: return 'Conflict — resource already exists or cannot be modified';
    case 422: return 'Validation failed';
    case 429: return 'Too many requests — please try again later';
    case 500: return 'Server error — please try again later';
    default: return 'Something went wrong';
  }
}
