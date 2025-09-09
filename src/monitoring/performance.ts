// CODECTI Platform - Performance Monitoring

import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface PerformanceReport {
  timestamp: string;
  metrics: {
    responseTime: {
      avg: number;
      p50: number;
      p90: number;
      p95: number;
      p99: number;
    };
    throughput: {
      requestsPerSecond: number;
      requestsPerMinute: number;
    };
    errorRate: {
      rate: number;
      count: number;
    };
    resourceUsage: {
      memoryMB?: number;
      cpuPercent?: number;
    };
  };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private requestTimes: number[] = [];
  private requestTimestamps: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;
  private maxMetrics = 1000;

  // Record a performance metric
  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags
    };

    this.metrics.unshift(metric);

    // Maintain max metrics limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    // Log significant performance issues
    if (name === 'response_time' && value > 5000) {
      logger.warn(`Slow response detected: ${value}ms`, 'PERFORMANCE', {
        responseTime: value,
        tags
      });
    }
  }

  // Record HTTP request performance
  recordRequest(responseTime: number, isError: boolean = false): void {
    this.requestTimes.unshift(responseTime);
    this.requestTimestamps.unshift(Date.now());
    this.totalRequests++;

    if (isError) {
      this.errorCount++;
    }

    // Keep only last 1000 request times for calculations
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(0, 1000);
    }

    // Keep only last hour of timestamps
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneHourAgo);

    // Record as metric
    this.recordMetric('response_time', responseTime, 'ms', {
      status: isError ? 'error' : 'success'
    });
  }

  // Calculate percentiles
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  // Get current performance report
  getPerformanceReport(): PerformanceReport {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentRequests = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);

    const avgResponseTime = this.requestTimes.length > 0
      ? this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length
      : 0;

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        responseTime: {
          avg: Math.round(avgResponseTime),
          p50: this.calculatePercentile(this.requestTimes, 50),
          p90: this.calculatePercentile(this.requestTimes, 90),
          p95: this.calculatePercentile(this.requestTimes, 95),
          p99: this.calculatePercentile(this.requestTimes, 99)
        },
        throughput: {
          requestsPerSecond: recentRequests.length / 60,
          requestsPerMinute: recentRequests.length
        },
        errorRate: {
          rate: this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0,
          count: this.errorCount
        },
        resourceUsage: {
          memoryMB: this.getMemoryUsage(),
          cpuPercent: this.getCpuUsage()
        }
      }
    };
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number | undefined {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return Math.round(usage.heapUsed / 1024 / 1024);
    }
    return undefined;
  }

  // Get CPU usage (approximation)
  private getCpuUsage(): number | undefined {
    if (typeof process !== 'undefined' && process.cpuUsage) {
      const usage = process.cpuUsage();
      const total = usage.user + usage.system;
      return Math.round((total / 1000000) * 100) / 100; // Convert to percentage
    }
    return undefined;
  }

  // Get metrics by name and time range
  getMetrics(
    name?: string, 
    startTime?: Date, 
    endTime?: Date, 
    limit = 100
  ): PerformanceMetric[] {
    let filtered = [...this.metrics];

    if (name) {
      filtered = filtered.filter(metric => metric.name === name);
    }

    if (startTime) {
      filtered = filtered.filter(metric => new Date(metric.timestamp) >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter(metric => new Date(metric.timestamp) <= endTime);
    }

    return filtered.slice(0, limit);
  }

  // Get slow requests
  getSlowRequests(threshold = 2000): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.name === 'response_time' && metric.value > threshold
    ).slice(0, 50);
  }

  // Performance health check
  getPerformanceHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: any;
  } {
    const report = this.getPerformanceReport();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check response times
    if (report.metrics.responseTime.p95 > 5000) {
      issues.push(`P95 response time too high: ${report.metrics.responseTime.p95}ms`);
      status = 'critical';
    } else if (report.metrics.responseTime.p95 > 2000) {
      issues.push(`P95 response time elevated: ${report.metrics.responseTime.p95}ms`);
      if (status !== 'critical') status = 'warning';
    }

    // Check error rate
    if (report.metrics.errorRate.rate > 10) {
      issues.push(`High error rate: ${report.metrics.errorRate.rate.toFixed(2)}%`);
      status = 'critical';
    } else if (report.metrics.errorRate.rate > 5) {
      issues.push(`Elevated error rate: ${report.metrics.errorRate.rate.toFixed(2)}%`);
      if (status !== 'critical') status = 'warning';
    }

    // Check memory usage
    if (report.metrics.resourceUsage.memoryMB && report.metrics.resourceUsage.memoryMB > 512) {
      issues.push(`High memory usage: ${report.metrics.resourceUsage.memoryMB}MB`);
      if (status !== 'critical') status = 'warning';
    }

    // Check throughput (requests per second should be reasonable)
    if (report.metrics.throughput.requestsPerSecond > 100) {
      issues.push(`Very high throughput: ${report.metrics.throughput.requestsPerSecond.toFixed(2)} req/s`);
      if (status !== 'critical') status = 'warning';
    }

    if (issues.length === 0) {
      issues.push('All performance metrics within normal ranges');
    }

    return {
      status,
      issues,
      metrics: report.metrics
    };
  }

  // Clear old metrics
  clearOldMetrics(olderThanHours = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoff
    );

    const removed = initialLength - this.metrics.length;
    if (removed > 0) {
      logger.info(`Cleaned ${removed} old performance metrics`, 'PERFORMANCE');
    }
  }

  // Generate performance summary
  getSummary(hours = 24): {
    timeRange: string;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    peakThroughput: number;
    slowestRequests: number;
  } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoff
    );

    const responseTimes = recentMetrics
      .filter(m => m.name === 'response_time')
      .map(m => m.value);

    const errorMetrics = recentMetrics.filter(m => 
      m.name === 'response_time' && m.tags?.status === 'error'
    );

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      timeRange: `Last ${hours} hours`,
      totalRequests: responseTimes.length,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: responseTimes.length > 0 
        ? (errorMetrics.length / responseTimes.length) * 100 
        : 0,
      peakThroughput: Math.max(...this.requestTimestamps.map((_, i, arr) => {
        if (i >= arr.length - 60) return 0; // Need at least 60 data points
        const minute = arr.slice(i, i + 60);
        return minute.length;
      })),
      slowestRequests: responseTimes.filter(time => time > 2000).length
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance middleware for Hono
export const performanceMiddleware = (monitor: PerformanceMonitor) => {
  return async (c: any, next: any) => {
    const start = Date.now();
    
    try {
      await next();
      const responseTime = Date.now() - start;
      const isError = c.res.status >= 400;
      
      monitor.recordRequest(responseTime, isError);
      
      // Record additional metrics
      monitor.recordMetric('request_count', 1, 'count', {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status.toString()
      });
      
    } catch (error) {
      const responseTime = Date.now() - start;
      monitor.recordRequest(responseTime, true);
      throw error;
    }
  };
};