export const SALGADO_TIME = {
  DAY_OF_WEEK: 3,
  HOUR: 14,
  MINUTE: 45,
  SECOND: 0,
} as const;

export const CACHE_TTL = 5 * 60 * 1000;

export const HOLIDAY_API_URL = 'https://brasilapi.com.br/api/feriados/v1';

export const STORAGE_KEYS = {
  THEME: 'salgado-theme',
  HISTORY: 'salgado-history',
  PREFERENCES: 'salgado-preferences',
} as const;

export const CHANCES = {
  LAST_WEEK_HAD: 99,
  HOLIDAY_BONUS: 1,
  MAX: 100,
  DEFAULT: 50,
} as const;