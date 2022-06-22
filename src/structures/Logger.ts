import pino, { Logger as PinoLogger, LoggerOptions } from 'pino'

export default class Logger {
  console: PinoLogger;

  constructor(options: LoggerOptions) {
    this.console = pino({
      transport: { target: "pino-pretty" },
      ...options
    })
  }
}