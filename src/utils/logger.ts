export interface Logger {
  info(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
}

export class ConsoleLogger implements Logger {
  private formatContext(context?: Record<string, any>): string {
    return context ? ` | Context: ${JSON.stringify(context)}` : '';
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  info(message: string, context?: Record<string, any>): void {
    console.log(`[${this.formatTimestamp()}] INFO: ${message}${this.formatContext(context)}`);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorInfo = error ? ` | Error: ${error.message}` : '';
    const stackTrace = error?.stack ? `\nStack: ${error.stack}` : '';
    console.error(`[${this.formatTimestamp()}] ERROR: ${message}${errorInfo}`);
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${this.formatTimestamp()}] WARN: ${message}${this.formatContext(context)}`);
  }
}

// Lazy initialization of default logger
let defaultLogger: Logger | undefined;

export const getDefaultLogger = (): Logger => {
  if (!defaultLogger) {
    defaultLogger = new ConsoleLogger();
  }
  return defaultLogger;
};