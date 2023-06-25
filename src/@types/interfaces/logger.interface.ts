export interface ILogger {
  info(...data: any[]): void;
  log(...data: any[]): void;
  warn(...data: any[]): void;
  error(...data: any[]): void;
}
