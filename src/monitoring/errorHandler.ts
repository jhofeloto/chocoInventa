// CODECTI Platform - Error Handler & Monitoring

import { Context } from 'hono';
import { logger } from './logger';
import type { Bindings } from '../types';

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    path: string;
    method: string;
    userId?: number;
    userAgent?: string;
    ip?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private maxErrors = 500;

  // Clasificar severidad del error
  private classifyError(error: Error, statusCode?: number): 'low' | 'medium' | 'high' | 'critical' {
    if (statusCode && statusCode >= 500) return 'critical';
    if (error.name === 'ValidationError') return 'medium';
    if (error.name === 'UnauthorizedError') return 'low';
    if (error.name === 'NotFoundError') return 'low';
    if (error.message.includes('Database') || error.message.includes('Connection')) return 'critical';
    if (error.message.includes('Auth') || error.message.includes('Token')) return 'medium';
    
    return 'medium';
  }

  // Reportar error
  reportError(
    error: Error,
    context: {
      path: string;
      method: string;
      userId?: number;
      userAgent?: string;
      ip?: string;
    },
    statusCode?: number
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: crypto.randomUUID ? crypto.randomUUID() : `error-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      severity: this.classifyError(error, statusCode),
      resolved: false
    };

    this.errors.unshift(errorReport);

    // Mantener solo los errores más recientes
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log del error
    logger.error(
      `Error ${error.name}: ${error.message}`,
      error,
      'ERROR_MONITOR',
      {
        errorId: errorReport.id,
        severity: errorReport.severity,
        path: context.path,
        method: context.method,
        userId: context.userId
      }
    );

    return errorReport;
  }

  // Obtener estadísticas de errores
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    last24h: number;
    resolved: number;
    unresolved: number;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last24hErrors = this.errors.filter(err => new Date(err.timestamp) > last24h);

    const byType = this.errors.reduce((acc, err) => {
      acc[err.error.name] = (acc[err.error.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.errors.reduce((acc, err) => {
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      last24h: last24hErrors.length,
      resolved: this.errors.filter(err => err.resolved).length,
      unresolved: this.errors.filter(err => !err.resolved).length
    };
  }

  // Obtener errores con filtros
  getErrors(filters?: {
    severity?: string;
    resolved?: boolean;
    limit?: number;
    search?: string;
  }): ErrorReport[] {
    let filtered = [...this.errors];

    if (filters?.severity) {
      filtered = filtered.filter(err => err.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      filtered = filtered.filter(err => err.resolved === filters.resolved);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(err => 
        err.error.name.toLowerCase().includes(search) ||
        err.error.message.toLowerCase().includes(search) ||
        err.context.path.toLowerCase().includes(search)
      );
    }

    const limit = filters?.limit || 50;
    return filtered.slice(0, limit);
  }

  // Marcar error como resuelto
  resolveError(errorId: string): boolean {
    const error = this.errors.find(err => err.id === errorId);
    if (error) {
      error.resolved = true;
      logger.info(`Error ${errorId} marked as resolved`, 'ERROR_MONITOR');
      return true;
    }
    return false;
  }

  // Obtener errores críticos no resueltos
  getCriticalErrors(): ErrorReport[] {
    return this.errors.filter(err => 
      err.severity === 'critical' && !err.resolved
    ).slice(0, 10);
  }

  // Limpiar errores antiguos
  clearOldErrors(olderThanDays = 7): void {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const initialLength = this.errors.length;
    this.errors = this.errors.filter(err => new Date(err.timestamp) > cutoff);
    
    const removed = initialLength - this.errors.length;
    if (removed > 0) {
      logger.info(`Cleaned ${removed} old errors older than ${olderThanDays} days`, 'ERROR_MONITOR');
    }
  }
}

// Instancia singleton del monitor de errores
export const errorMonitor = new ErrorMonitor();

// Middleware de manejo de errores para Hono
export const errorHandlerMiddleware = () => {
  return async (c: Context<{ Bindings: Bindings }>, next: any) => {
    try {
      await next();
    } catch (error) {
      const err = error as Error;
      const user = c.get('user');
      
      // Reportar el error
      const errorReport = errorMonitor.reportError(err, {
        path: c.req.path,
        method: c.req.method,
        userId: user?.userId,
        userAgent: c.req.header('User-Agent'),
        ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')
      });

      // Determinar código de estado HTTP
      let statusCode = 500;
      if (err.name === 'ValidationError') statusCode = 400;
      if (err.name === 'UnauthorizedError') statusCode = 401;
      if (err.name === 'ForbiddenError') statusCode = 403;
      if (err.name === 'NotFoundError') statusCode = 404;

      // Respuesta de error estructurada
      return c.json({
        success: false,
        error: {
          id: errorReport.id,
          message: process.env.NODE_ENV === 'production' 
            ? 'Se ha producido un error interno del servidor'
            : err.message,
          type: err.name
        },
        timestamp: new Date().toISOString()
      }, statusCode);
    }
  };
};

// Clases de errores personalizadas
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Acceso denegado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public operation?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}