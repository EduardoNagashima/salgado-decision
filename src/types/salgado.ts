export interface Holiday {
  date: string;
  name: string;
}

export interface WeekData {
  hadSalgadoLastWeek: boolean;
  weekNumber: number;
  year: number;
}

export interface SalgadoResult {
  chances: number;
  nextSalgadoDate: Date;
  lastUpdated: Date;
  history: WeekData[];
}

export interface HolidayApiResponse {
  date: string;
  name: string;
  type: string;
}