// CODECTI Platform - Health Check System

import { logger } from '../monitoring/logger';
import { errorMonitor } from '../monitoring/errorHandler';
import type { Bindings } from '../types';

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  responseTime: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    memoryUsage?: number;
  };
}

export class HealthChecker {
  private startTime = Date.now();
  private version = '1.0.0';
  private environment = process.env.NODE_ENV || 'development';

  // Check individual de base de datos
  async checkDatabase(bindings?: Bindings): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      if (bindings?.DB) {
        // Test simple query en D1
        await bindings.DB.prepare('SELECT 1 as test').first();
        
        return {
          name: 'database',
          status: 'healthy',
          message: 'Conexión a base de datos D1 exitosa',
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          details: {
            type: 'Cloudflare D1',
            query: 'SELECT 1 as test'
          }
        };
      } else {
        // Modo desarrollo con mock database
        return {
          name: 'database',
          status: 'warning',
          message: 'Usando base de datos mock (desarrollo)',
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          details: {
            type: 'Mock Database',
            mode: 'development'
          }
        };
      }
    } catch (error) {
      return {
        name: 'database',
        status: 'critical',
        message: `Error de conexión a base de datos: ${(error as Error).message}`,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          error: (error as Error).name,
          message: (error as Error).message
        }
      };
    }
  }

  // Check de almacenamiento R2
  async checkStorage(bindings?: Bindings): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      if (bindings?.R2) {
        // Test simple en R2
        const testKey = `health-check-${Date.now()}`;
        const testContent = 'health check test';
        
        await bindings.R2.put(testKey, testContent);
        const retrieved = await bindings.R2.get(testKey);
        await bindings.R2.delete(testKey);
        
        if (retrieved) {
          return {
            name: 'storage',
            status: 'healthy',
            message: 'Almacenamiento R2 funcionando correctamente',
            responseTime: Date.now() - start,
            timestamp: new Date().toISOString(),
            details: {
              type: 'Cloudflare R2',
              operations: ['put', 'get', 'delete']
            }
          };
        } else {
          return {
            name: 'storage',
            status: 'warning',
            message: 'Problema al recuperar archivo de prueba de R2',
            responseTime: Date.now() - start,
            timestamp: new Date().toISOString()
          };
        }
      } else {
        return {
          name: 'storage',
          status: 'warning',
          message: 'Usando almacenamiento mock (desarrollo)',
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          details: {
            type: 'Mock Storage',
            mode: 'development'
          }
        };
      }
    } catch (error) {
      return {
        name: 'storage',
        status: 'critical',
        message: `Error de almacenamiento R2: ${(error as Error).message}`,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          error: (error as Error).name,
          message: (error as Error).message
        }
      };
    }
  }

  // Check de autenticación
  async checkAuthentication(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Simular creación y verificación de JWT
      const { signJWT, verifyJWT } = await import('../utils/auth');
      const testPayload = { userId: 1, email: 'test@test.com', role: 'admin' };
      const token = await signJWT(testPayload, 'test-secret');
      const verified = await verifyJWT(token, 'test-secret');
      
      if (verified && verified.userId === testPayload.userId) {
        return {
          name: 'authentication',
          status: 'healthy',
          message: 'Sistema de autenticación JWT funcionando',
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          details: {
            jwtGeneration: 'ok',
            jwtVerification: 'ok'
          }
        };
      } else {
        return {
          name: 'authentication',
          status: 'critical',
          message: 'Falla en verificación de JWT',
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'authentication',
        status: 'critical',
        message: `Error en sistema de autenticación: ${(error as Error).message}`,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          error: (error as Error).name,
          message: (error as Error).message
        }
      };
    }
  }

  // Check de logs y monitoreo
  async checkMonitoring(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      const metrics = logger.getMetrics();
      const errorStats = errorMonitor.getErrorStats();
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'Sistema de monitoreo funcionando correctamente';
      
      // Evaluar estado basado en métricas
      if (errorStats.bySeverity.critical > 10) {
        status = 'critical';
        message = `Demasiados errores críticos: ${errorStats.bySeverity.critical}`;
      } else if (errorStats.last24h > 50) {
        status = 'warning';
        message = `Alto número de errores en 24h: ${errorStats.last24h}`;
      } else if (metrics.slowRequests > 10) {
        status = 'warning';
        message = `Múltiples requests lentos detectados: ${metrics.slowRequests}`;
      }
      
      return {
        name: 'monitoring',
        status,
        message,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        details: {
          totalLogs: metrics.totalLogs,
          errors24h: errorStats.last24h,
          averageResponseTime: metrics.averageResponseTime,
          slowRequests: metrics.slowRequests
        }
      };
    } catch (error) {
      return {
        name: 'monitoring',
        status: 'critical',
        message: `Error en sistema de monitoreo: ${(error as Error).message}`,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Health check completo del sistema
  async getSystemHealth(bindings?: Bindings): Promise<SystemHealth> {
    const checks = await Promise.all([
      this.checkDatabase(bindings),
      this.checkStorage(bindings),
      this.checkAuthentication(),
      this.checkMonitoring()
    ]);

    // Determinar estado general del sistema
    const hasCritical = checks.some(check => check.status === 'critical');
    const hasWarning = checks.some(check => check.status === 'warning');
    
    const systemStatus = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

    // Obtener métricas generales
    const logMetrics = logger.getMetrics();
    const errorStats = errorMonitor.getErrorStats();
    
    const errorRate = logMetrics.totalLogs > 0 
      ? (errorStats.total / logMetrics.totalLogs) * 100 
      : 0;

    const systemHealth: SystemHealth = {
      status: systemStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: this.environment,
      checks,
      metrics: {
        totalRequests: logMetrics.totalLogs,
        errorRate: Math.round(errorRate * 100) / 100,
        averageResponseTime: logMetrics.averageResponseTime,
        memoryUsage: this.getMemoryUsage()
      }
    };

    // Log del health check
    logger.info(
      `Health check completed - Status: ${systemStatus}`,
      'HEALTH_CHECK',
      {
        status: systemStatus,
        checksCount: checks.length,
        uptime: systemHealth.uptime,
        errorRate: systemHealth.metrics.errorRate
      }
    );

    return systemHealth;
  }

  // Obtener uso de memoria (si está disponible)
  private getMemoryUsage(): number | undefined {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100; // MB
    }
    return undefined;
  }

  // Health check rápido para liveness probe
  async quickHealthCheck(bindings?: Bindings): Promise<{ status: 'ok' | 'error', uptime: number }> {
    try {
      // Check básico de base de datos
      if (bindings?.DB) {
        await bindings.DB.prepare('SELECT 1').first();
      }
      
      return {
        status: 'ok',
        uptime: Date.now() - this.startTime
      };
    } catch (error) {
      logger.error('Quick health check failed', error as Error, 'HEALTH_CHECK');
      return {
        status: 'error',
        uptime: Date.now() - this.startTime
      };
    }
  }
}

// Instancia singleton del health checker
export const healthChecker = new HealthChecker();