const isDev = import.meta.env.DEV;

export const logger = {
  log(...args) {
    if (isDev) {
      console.log('[CardTrading]', ...args);
    }
  },

  warn(...args) {
    if (isDev) {
      console.warn('[CardTrading]', ...args);
    }
  },

  error(...args) {
    // Always log errors regardless of environment
    console.error('[CardTrading]', ...args);
  },
};

export default logger;
