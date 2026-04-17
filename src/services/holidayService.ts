import { Holiday } from '../types';
import { HOLIDAY_API_URL } from '../utils/constants';
import { HolidayApiResponse } from '../types/salgado';

const holidayCache = new Map<string, { holidays: Holiday[]; expiry: number }>();

export async function fetchHolidays(year: number): Promise<Holiday[]> {
  const cacheKey = String(year);
  const cached = holidayCache.get(cacheKey);

  if (cached && Date.now() < cached.expiry) {
    return cached.holidays;
  }

  try {
    const response = await fetch(`${HOLIDAY_API_URL}/${year}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: HolidayApiResponse[] = await response.json();

    const holidays: Holiday[] = data.map((item) => ({
      date: item.date,
      name: item.name,
    }));

    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    holidayCache.set(cacheKey, { holidays, expiry });

    return holidays;
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    return [];
  }
}

export function getHolidaysForWeek(holidays: Holiday[], weekStart: Date, weekEnd: Date): Holiday[] {
  return holidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= weekStart && holidayDate <= weekEnd;
  });
}

export function clearHolidayCache(): void {
  holidayCache.clear();
}