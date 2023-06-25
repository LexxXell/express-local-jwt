import { ILogger } from '../@types';
import 'colors';

const date = () => new Date().toISOString().yellow;

export class Logger implements ILogger {
  private namespace: string;
  constructor(namespace: string = '') {
    this.namespace = namespace;
  }
  info(message?: any, ...optionalParams: any[]): void {
    console.log(
      `${date()} ` + ' [INFO]'.bgWhite + ' ' + (this.namespace ? this.namespace + ': ' : '').green,
      message,
      ...optionalParams,
    );
  }
  log(message?: any, ...optionalParams: any[]): void {
    console.log(
      `${date()} ` + ' [LOG] '.bgGreen + ' ' + (this.namespace ? this.namespace + ': ' : '').green,
      message,
      ...optionalParams,
    );
  }
  warn(message?: any, ...optionalParams: any[]): void {
    console.log(
      `${date()} ` + ' [WARN]'.bgYellow + ' ' + (this.namespace ? this.namespace + ': ' : '').green,
      message,
      ...optionalParams,
    );
  }
  error(message?: any, ...optionalParams: any[]): void {
    console.log(
      `${date()} ` + '[ERROR]'.bgRed + ' ' + (this.namespace ? this.namespace + ': ' : '').green,
      message,
      ...optionalParams,
    );
  }
}
