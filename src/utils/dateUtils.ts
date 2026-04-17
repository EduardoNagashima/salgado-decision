import { SALGADO_TIME } from './constants';

export function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return Math.round(
    (d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7) / 7
  );
}

export function getNextWednesday(fromDate: Date = new Date()): Date {
  const result = new Date(fromDate);
  const currentDay = result.getDay();
  const daysUntilWednesday = (SALGADO_TIME.DAY_OF_WEEK - currentDay + 7) % 7;
  result.setDate(result.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
  result.setHours(SALGADO_TIME.HOUR, SALGADO_TIME.MINUTE, SALGADO_TIME.SECOND, 0);
  return result;
}

export function isWednesday(date: Date): boolean {
  return date.getDay() === SALGADO_TIME.DAY_OF_WEEK;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}