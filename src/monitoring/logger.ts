// CODECTI Platform - Advanced Logging System

import { v4 as uuidv4 } from 'uuid';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: number;
  userEmail?: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

export interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  averageResponseTime: number;
  slowRequests: number;
  last24hErrors: LogEntry[];
}

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Mantener máximo 1000 logs en memoria
  private slowRequestThreshold = 2000; // 2 segundos

  // Constructor público para permitir testing
  constructor() {}

  // Método estático para crear instancia de testing
  static createTestInstance(): Logger {
    return new Logger();
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    // Mantener solo los logs más recientes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log a la consola en desarrollo
    if (typeof console !== 'undefined') {
      const logMethod = entry.level === LogLevel.ERROR ? 'error' :
                       entry.level === LogLevel.WARN ? 'warn' : 'log';
      
      console[logMethod](`[${entry.timestamp}] ${entry.level}: ${entry.message}`, 
                        entry.metadata ? entry.metadata : '');
    }
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, metadata);
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.addLog(entry);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, metadata);
    this.addLog(entry);
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, metadata);
    this.addLog(entry);
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, metadata);
    this.addLog(entry);
  }

  // Log de requests HTTP
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    userId?: number,
    userEmail?: string,
    requestId?: string
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR :
                  statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    const message = `${method} ${path} - ${statusCode} (${responseTime}ms)`;
    
    const entry = this.createLogEntry(level, message, 'HTTP_REQUEST', {
      method,
      path,
      statusCode,
      responseTime,
      userId,
      userEmail,
      requestId,
      isSlowRequest: responseTime > this.slowRequestThreshold
    });

    entry.method = method;
    entry.path = path;
    entry.statusCode = statusCode;
    entry.responseTime = responseTime;
    entry.userId = userId;
    entry.userEmail = userEmail;
    entry.requestId = requestId;

    this.addLog(entry);
  }

  // Obtener métricas del sistema
  getMetrics(): LogMetrics {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last24hLogs = this.logs.filter(log => new Date(log.timestamp) > last24h);
    const errorLogs = last24hLogs.filter(log => log.level === LogLevel.ERROR);
    const warningLogs = last24hLogs.filter(log => log.level === LogLevel.WARN);
    const requestLogs = this.logs.filter(log => log.context === 'HTTP_REQUEST');
    const slowRequests = requestLogs.filter(log => log.responseTime && log.responseTime > this.slowRequestThreshold);

    const totalResponseTime = requestLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0);
    const averageResponseTime = requestLogs.length > 0 ? totalResponseTime / requestLogs.length : 0;

    return {
      totalLogs: this.logs.length,
      errorCount: errorLogs.length,
      warningCount: warningLogs.length,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests: slowRequests.length,
      last24hErrors: errorLogs.slice(0, 10) // Últimos 10 errores
    };
  }

  // Obtener logs filtrados
  getLogs(
    level?: LogLevel,
    context?: string,
    limit = 100,
    search?: string
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (context) {
      filteredLogs = filteredLogs.filter(log => log.context === context);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.context?.toLowerCase().includes(searchLower)
      );
    }

    return filteredLogs.slice(0, limit);
  }

  // Limpiar logs antiguos
  clearLogs(olderThanHours?: number): void {
    if (olderThanHours) {
      const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
      this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoff);
    } else {
      this.logs = [];
    }
  }

  // Exportar logs para análisis
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'context', 'path', 'statusCode', 'responseTime'];
      const rows = this.logs.map(log => [
        log.timestamp,
        log.level,
        log.message,
        log.context || '',
        log.path || '',
        log.statusCode || '',
        log.responseTime || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Middleware de logging para Hono
export const loggingMiddleware = (logger: Logger) => {
  return async (c: any, next: any) => {
    const start = Date.now();
    const requestId = uuidv4();
    
    // Añadir request ID al contexto
    c.set('requestId', requestId);
    
    try {
      await next();
      
      const responseTime = Date.now() - start;
      const user = c.get('user');
      
      logger.logRequest(
        c.req.method,
        c.req.path,
        c.res.status,
        responseTime,
        user?.userId,
        user?.email,
        requestId
      );
    } catch (error) {
      const responseTime = Date.now() - start;
      const user = c.get('user');
      
      logger.error(
        `Request failed: ${c.req.method} ${c.req.path}`,
        error as Error,
        'HTTP_REQUEST',
        {
          method: c.req.method,
          path: c.req.path,
          responseTime,
          userId: user?.userId,
          userEmail: user?.email,
          requestId
        }
      );
      
      throw error;
    }
  };
};