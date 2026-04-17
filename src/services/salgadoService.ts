import { Holiday, WeekData } from '../types';
import { CHANCES } from '../utils/constants';
import { getNextWednesday, getWeekRange, getISOWeek } from '../utils/dateUtils';
import { getStoredHistory, addToHistory } from './storageService';
import { fetchHolidays, getHolidaysForWeek } from './holidayService';

export interface SalgadoServiceResult {
  chances: number;
  nextDate: Date;
  lastUpdated: Date;
  holidaysThisWeek: Holiday[];
  isLoading: boolean;
  error: string | null;
}

export async function calculateSalgadoChances(): Promise<SalgadoServiceResult> {
  const now = new Date();
  const { start: weekStart, end: weekEnd } = getWeekRange(now);

  const currentYear = now.getFullYear();
  const holidays = await fetchHolidays(currentYear);
  const holidaysThisWeek = getHolidaysForWeek(holidays, weekStart, weekEnd);

  const history = getStoredHistory();
  const lastWeekEntry = history.length > 0 ? history[0] : null;

  let chances = CHANCES.DEFAULT;

  if (lastWeekEntry?.hadSalgadoLastWeek) {
    chances = CHANCES.LAST_WEEK_HAD;
  }

  if (holidaysThisWeek.length > 0) {
    const hasWednesdayHoliday = holidaysThisWeek.some((h) => {
      const holidayDate = new Date(h.date);
      return holidayDate.getDay() === 3;
    });

    if (!hasWednesdayHoliday) {
      chances = Math.min(chances + CHANCES.HOLIDAY_BONUS, CHANCES.MAX);
    }
  }

  const nextDate = getNextWednesday(now);

  const entry: WeekData = {
    hadSalgadoLastWeek: chances >= 50,
    weekNumber: getISOWeek(now),
    year: currentYear,
  };
  addToHistory(entry);

  return {
    chances,
    nextDate,
    lastUpdated: now,
    holidaysThisWeek,
    isLoading: false,
    error: null,
  };
}

export function getNextSalgadoDate(fromDate: Date = new Date()): Date {
  return getNextWednesday(fromDate);
}