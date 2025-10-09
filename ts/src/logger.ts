import * as fs from "fs";
import * as path from "path";

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

class Logger {
  private enabled: boolean = false;
  private logFile: string | null = null;
  private maxContentSize: number = 5000;

  constructor() {
    const debugEnv = process.env.NVIM_REDRAFT_DEBUG;
    const logFileEnv = process.env.NVIM_REDRAFT_LOG_FILE;

    this.enabled = debugEnv === "1";
    this.logFile = logFileEnv || null;

    if (this.enabled && this.logFile) {
      this.ensureLogFile();
    }
  }

  private ensureLogFile(): void {
    if (!this.logFile) return;

    try {
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }

      if (!fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, "", { mode: 0o600 });
      }
    } catch (error) {
      console.error(`[nvim-redraft] Failed to initialize log file: ${error}`);
      this.enabled = false;
    }
  }

  private formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private truncateContent(content: string): string {
    if (this.maxContentSize === 0 || content.length <= this.maxContentSize) {
      return content;
    }

    const truncated = content.substring(0, this.maxContentSize);
    const remaining = content.length - this.maxContentSize;
    return `${truncated}\n... (truncated, ${remaining} more chars)`;
  }

  private writeLog(level: LogLevel, source: string, message: string, content?: string): void {
    if (!this.enabled || !this.logFile) return;

    try {
      const timestamp = this.formatTimestamp();
      const logLine = `[${timestamp}] [${level}] [ts:${source}] ${message}\n`;

      let logContent = logLine;

      if (content) {
        const safeContent = this.truncateContent(content);
        const indentedContent = safeContent
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n");
        logContent += indentedContent + "\n";
      }

      fs.appendFileSync(this.logFile, logContent);
    } catch (error) {
      console.error(`[nvim-redraft] Failed to write log: ${error}`);
    }
  }

  debug(source: string, message: string, content?: string): void {
    this.writeLog(LogLevel.DEBUG, source, message, content);
  }

  info(source: string, message: string, content?: string): void {
    this.writeLog(LogLevel.INFO, source, message, content);
  }

  warn(source: string, message: string, content?: string): void {
    this.writeLog(LogLevel.WARN, source, message, content);
  }

  error(source: string, message: string, content?: string): void {
    this.writeLog(LogLevel.ERROR, source, message, content);
  }
}

export const logger = new Logger();
