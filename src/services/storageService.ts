import { STORAGE_KEYS } from '../utils/constants';
import { WeekData } from '../types';
import { getItem, setItem } from '../utils/localStorageUtils';

const MAX_HISTORY_SIZE = 12;

export function getStoredHistory(): WeekData[] {
  return getItem<WeekData[]>(STORAGE_KEYS.HISTORY, []);
}

export function addToHistory(entry: WeekData): void {
  const history = getStoredHistory();
  history.unshift(entry);

  if (history.length > MAX_HISTORY_SIZE) {
    history.pop();
  }

  setItem(STORAGE_KEYS.HISTORY, history);
}

export function getLastWeekEntry(): WeekData | null {
  const history = getStoredHistory();
  return history.length > 0 ? history[0] : null;
}

export function clearHistory(): void {
  setItem(STORAGE_KEYS.HISTORY, []);
}