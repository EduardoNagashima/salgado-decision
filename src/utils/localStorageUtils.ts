import { STORAGE_KEYS } from './constants';

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`Failed to save ${key} to localStorage`);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.error(`Failed to remove ${key} from localStorage`);
  }
}

export function getTheme(): 'light' | 'dark' {
  return getItem(STORAGE_KEYS.THEME, 'dark');
}

export function setTheme(theme: 'light' | 'dark'): void {
  setItem(STORAGE_KEYS.THEME, theme);
}

export function getHistory<T>(): T[] {
  return getItem<T[]>(STORAGE_KEYS.HISTORY, []);
}

export function setHistory<T>(history: T[]): void {
  setItem(STORAGE_KEYS.HISTORY, history);
}