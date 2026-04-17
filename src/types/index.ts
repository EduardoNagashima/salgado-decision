export * from './salgado';
export * from './theme';

export type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

export interface LogEntry {
  nivel: LogLevel;
  msg: string;
  meta: Record<string, unknown>;
  ts: string;
}