export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export const MAX_TRADE_CARDS_PER_SIDE = 3;

export const DEFAULT_PAGE_SIZE = 12;

export const TOAST_DURATION_MS = 4000;

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MAX_BIO_LENGTH = 500;
export const MAX_LOCATION_LENGTH = 100;

export const CARD_RARITIES = ['common', 'rare', 'epic', 'legendary'];

export const CARD_CONDITIONS = ['mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor'];

export const TRADE_STATUSES = ['pending', 'completed', 'rejected', 'cancelled'];

export const ACTIVITY_EVENT_TYPES = {
  CARD_CREATED: 'card_created',
  CARD_UPDATED: 'card_updated',
  CARD_DELETED: 'card_deleted',
  TRADE_PROPOSED: 'trade_proposed',
  TRADE_ACCEPTED: 'trade_accepted',
  TRADE_REJECTED: 'trade_rejected',
  TRADE_CANCELLED: 'trade_cancelled',
  PROFILE_UPDATED: 'profile_updated',
};

export const TRADE_STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const CONDITION_LABELS = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  light_played: 'Light Played',
  played: 'Played',
  poor: 'Poor',
};

export const RARITY_BADGE_VARIANTS = {
  common: 'neutral',
  rare: 'info',
  epic: 'warning',
  legendary: 'success',
};

export const TRADE_STATUS_BADGE_VARIANTS = {
  pending: 'warning',
  completed: 'success',
  rejected: 'error',
  cancelled: 'neutral',
};

export const ADMIN_STATS_PERIODS = ['7d', '30d', '90d'];

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};
