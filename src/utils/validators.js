import { MAX_IMAGE_SIZE_BYTES, ACCEPTED_IMAGE_TYPES, MAX_TRADE_CARDS_PER_SIDE } from './constants';

export function validateEmail(value) {
  if (!value || !value.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return 'Enter a valid email address';
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validatePasswordConfirm(value, original) {
  if (!value) return 'Please confirm your password';
  if (value !== original) return 'Passwords do not match';
  return null;
}

export function validateUsername(value) {
  if (!value || !value.trim()) return 'Username is required';
  if (value.trim().length < 3) return 'Username must be at least 3 characters';
  if (value.trim().length > 30) return 'Username must be 30 characters or less';
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!usernameRegex.test(value.trim())) return 'Username can only contain letters, numbers, underscores, dots, and hyphens';
  return null;
}

export function validateRequired(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') return `${fieldName} is required`;
  if (typeof value === 'string' && !value.trim()) return `${fieldName} is required`;
  return null;
}

export function validateMaxLength(value, max, fieldName = 'This field') {
  if (!value) return null;
  if (value.length > max) return `${fieldName} must be ${max} characters or less`;
  return null;
}

export function validateImageFile(file) {
  if (!file) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'File must be a JPG, PNG, or WebP image';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be smaller than 5MB`;
  }
  return null;
}

export function validateCardSide(cards) {
  if (!Array.isArray(cards)) return 'Invalid selection';
  if (cards.length === 0) return 'Select at least 1 card';
  if (cards.length > MAX_TRADE_CARDS_PER_SIDE) {
    return `Maximum ${MAX_TRADE_CARDS_PER_SIDE} cards per side`;
  }
  return null;
}

export function validateCardNumber(value) {
  if (!value && value !== 0) return 'Card number is required';
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1) return 'Card number must be a positive integer';
  return null;
}
