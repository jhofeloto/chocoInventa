// CODECTI Platform - Alert System

import { logger } from './logger';
import { errorMonitor } from './errorHandler';
import { performanceMonitor } from './performance';
import { healthChecker } from '../health/healthCheck';

export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'health' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  data?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  type: 'performance' | 'error' | 'health' | 'resource';
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration?: number; // Duration in seconds before triggering
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number; // Minimum time between alerts
}

export class AlertManager {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private maxAlerts = 1000;
  private lastAlertTime: Map<string, number> = new Map();
  private initialized = false;

  constructor() {
    // Don't initialize automatically to avoid global scope issues in Workers
  }

  // Initialize the alert manager (call this in request handlers)
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeDefaultRules();
      this.initialized = true;
    }
  }

  // Initialize default alert rules
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        type: 'error',
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 10, // 10%
          duration: 300 // 5 minutes
        },
        severity: 'high',
        enabled: true,
        cooldownMinutes: 15
      },
      {
        id: 'critical-error-rate',
        name: 'Critical Error Rate',
        type: 'error',
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 25, // 25%
          duration: 60 // 1 minute
        },
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 10
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Times',
        type: 'performance',
        condition: {
          metric: 'response_time_p95',
          operator: 'gt',
          threshold: 5000, // 5 seconds
          duration: 300 // 5 minutes
        },
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 10
      },
      {
        id: 'very-slow-response-time',
        name: 'Very Slow Response Times',
        type: 'performance',
        condition: {
          metric: 'response_time_p95',
          operator: 'gt',
          threshold: 10000, // 10 seconds
          duration: 60 // 1 minute
        },
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 5
      },
      {
        id: 'system-unhealthy',
        name: 'System Health Critical',
        type: 'health',
        condition: {
          metric: 'health_status',
          operator: 'eq',
          threshold: 0, // 0 = critical
          duration: 60 // 1 minute
        },
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 5
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        type: 'resource',
        condition: {
          metric: 'memory_mb',
          operator: 'gt',
          threshold: 512, // 512MB
          duration: 600 // 10 minutes
        },
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 30
      },
      {
        id: 'critical-errors-count',
        name: 'Multiple Critical Errors',
        type: 'error',
        condition: {
          metric: 'critical_errors_count',
          operator: 'gte',
          threshold: 5, // 5 or more critical errors
          duration: 300 // 5 minutes
        },
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 15
      }
    ];

    logger.info(`Initialized ${this.rules.length} alert rules`, 'ALERTS');
  }

  // Start monitoring and checking alert conditions
  private startMonitoring(): void {
    // In Cloudflare Workers, we can't use setInterval in global scope
    // Alert checking will be done on-demand in request handlers
    logger.info('Alert monitoring configured (on-demand mode)', 'ALERTS');
  }

  // Check all enabled alert rules
  private async checkAlertConditions(): Promise<void> {
    for (const rule of this.rules.filter(r => r.enabled)) {
      try {
        const shouldAlert = await this.evaluateRule(rule);
        if (shouldAlert && this.canTriggerAlert(rule.id)) {
          this.triggerAlert(rule);
        }
      } catch (error) {
        logger.error(`Error evaluating alert rule ${rule.id}`, error as Error, 'ALERTS');
      }
    }
  }

  // Evaluate a single alert rule
  private async evaluateRule(rule: AlertRule): Promise<boolean> {
    let currentValue: number;

    switch (rule.type) {
      case 'performance':
        const perfReport = performanceMonitor.getPerformanceReport();
        switch (rule.condition.metric) {
          case 'response_time_avg':
            currentValue = perfReport.metrics.responseTime.avg;
            break;
          case 'response_time_p95':
            currentValue = perfReport.metrics.responseTime.p95;
            break;
          case 'response_time_p99':
            currentValue = perfReport.metrics.responseTime.p99;
            break;
          case 'requests_per_second':
            currentValue = perfReport.metrics.throughput.requestsPerSecond;
            break;
          default:
            return false;
        }
        break;

      case 'error':
        const errorStats = errorMonitor.getErrorStats();
        const logMetrics = logger.getMetrics();
        switch (rule.condition.metric) {
          case 'error_rate':
            currentValue = logMetrics.totalLogs > 0 
              ? (errorStats.total / logMetrics.totalLogs) * 100 
              : 0;
            break;
          case 'critical_errors_count':
            currentValue = errorStats.bySeverity.critical || 0;
            break;
          case 'errors_24h':
            currentValue = errorStats.last24h;
            break;
          default:
            return false;
        }
        break;

      case 'health':
        const systemHealth = await healthChecker.getSystemHealth();
        switch (rule.condition.metric) {
          case 'health_status':
            currentValue = systemHealth.status === 'critical' ? 0 : 
                          systemHealth.status === 'warning' ? 1 : 2;
            break;
          default:
            return false;
        }
        break;

      case 'resource':
        const perfMetrics = performanceMonitor.getPerformanceReport();
        switch (rule.condition.metric) {
          case 'memory_mb':
            currentValue = perfMetrics.metrics.resourceUsage.memoryMB || 0;
            break;
          case 'cpu_percent':
            currentValue = perfMetrics.metrics.resourceUsage.cpuPercent || 0;
            break;
          default:
            return false;
        }
        break;

      default:
        return false;
    }

    // Evaluate condition
    switch (rule.condition.operator) {
      case 'gt':
        return currentValue > rule.condition.threshold;
      case 'gte':
        return currentValue >= rule.condition.threshold;
      case 'lt':
        return currentValue < rule.condition.threshold;
      case 'lte':
        return currentValue <= rule.condition.threshold;
      case 'eq':
        return currentValue === rule.condition.threshold;
      default:
        return false;
    }
  }

  // Check if we can trigger an alert (respecting cooldown)
  private canTriggerAlert(ruleId: string): boolean {
    const lastTime = this.lastAlertTime.get(ruleId);
    if (!lastTime) return true;

    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) return false;

    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    return Date.now() - lastTime > cooldownMs;
  }

  // Trigger an alert
  private triggerAlert(rule: AlertRule): void {
    const alert: Alert = {
      id: crypto.randomUUID ? crypto.randomUUID() : `alert-${Date.now()}-${Math.random()}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: `Alert triggered: ${rule.name}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      data: {
        ruleId: rule.id,
        condition: rule.condition
      }
    };

    this.alerts.unshift(alert);
    this.lastAlertTime.set(rule.id, Date.now());

    // Maintain max alerts limit
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Log the alert
    logger.warn(
      `ALERT: ${alert.title}`,
      'ALERTS',
      {
        alertId: alert.id,
        severity: alert.severity,
        type: alert.type,
        ruleId: rule.id
      }
    );

    // Send notification (implement as needed)
    this.sendNotification(alert);
  }

  // Send alert notification (placeholder for future implementation)
  private sendNotification(alert: Alert): void {
    // In the future, this could send emails, Slack messages, etc.
    logger.info(`Alert notification sent: ${alert.title}`, 'ALERTS', {
      alertId: alert.id,
      severity: alert.severity
    });
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    this.ensureInitialized();
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Get all alerts with optional filtering
  getAlerts(filters?: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
  }): Alert[] {
    this.ensureInitialized();
    let filtered = [...this.alerts];

    if (filters?.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    if (filters?.severity) {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      filtered = filtered.filter(alert => alert.resolved === filters.resolved);
    }

    const limit = filters?.limit || 50;
    return filtered.slice(0, limit);
  }

  // Resolve an alert
  resolveAlert(alertId: string): boolean {
    this.ensureInitialized();
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      
      logger.info(`Alert resolved: ${alert.title}`, 'ALERTS', {
        alertId: alert.id
      });
      
      return true;
    }
    return false;
  }

  // Get alert statistics
  getAlertStats(): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    last24h: number;
  } {
    this.ensureInitialized();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last24hAlerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > last24h
    );

    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.alerts.length,
      active: this.alerts.filter(a => !a.resolved).length,
      resolved: this.alerts.filter(a => a.resolved).length,
      bySeverity,
      byType,
      last24h: last24hAlerts.length
    };
  }

  // Add or update an alert rule
  addRule(rule: AlertRule): void {
    const existingIndex = this.rules.findIndex(r => r.id === rule.id);
    if (existingIndex >= 0) {
      this.rules[existingIndex] = rule;
    } else {
      this.rules.push(rule);
    }

    logger.info(`Alert rule ${rule.enabled ? 'added' : 'updated'}: ${rule.name}`, 'ALERTS');
  }

  // Enable/disable a rule
  toggleRule(ruleId: string, enabled: boolean): boolean {
    this.ensureInitialized();
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      logger.info(`Alert rule ${enabled ? 'enabled' : 'disabled'}: ${rule.name}`, 'ALERTS');
      return true;
    }
    return false;
  }

  // Get alert rules
  getRules(): AlertRule[] {
    this.ensureInitialized();
    return [...this.rules];
  }

  // Clear old alerts
  clearOldAlerts(olderThanDays = 30): void {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const initialLength = this.alerts.length;
    
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > cutoff
    );

    const removed = initialLength - this.alerts.length;
    if (removed > 0) {
      logger.info(`Cleaned ${removed} old alerts older than ${olderThanDays} days`, 'ALERTS');
    }
  }
}

// Singleton instance
export const alertManager = new AlertManager();