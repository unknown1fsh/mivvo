/**
 * Monitoring Utilities
 * 
 * Application Performance Monitoring (APM) ve analytics entegrasyonu.
 */

import { logInfo, logError } from './logger';

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
}

const performanceMetrics: PerformanceMetrics[] = [];

/**
 * Performance metric kaydet
 */
export function recordPerformanceMetric(metric: PerformanceMetrics): void {
  performanceMetrics.push(metric);

  // Son 1000 metrik'i tut
  if (performanceMetrics.length > 1000) {
    performanceMetrics.shift();
  }

  // Yavaş endpoint'leri logla (>1 saniye)
  if (metric.duration > 1000) {
    logInfo('Slow endpoint detected', {
      endpoint: metric.endpoint,
      method: metric.method,
      duration: metric.duration,
      statusCode: metric.statusCode,
    });
  }
}

/**
 * Performance metriklerini al
 */
export function getPerformanceMetrics(): {
  averageResponseTime: number;
  totalRequests: number;
  slowEndpoints: Array<{ endpoint: string; avgDuration: number; count: number }>;
} {
  if (performanceMetrics.length === 0) {
    return {
      averageResponseTime: 0,
      totalRequests: 0,
      slowEndpoints: [],
    };
  }

  const totalDuration = performanceMetrics.reduce((sum, m) => sum + m.duration, 0);
  const averageResponseTime = totalDuration / performanceMetrics.length;

  // Endpoint bazında grupla
  const endpointStats = new Map<string, { totalDuration: number; count: number }>();

  performanceMetrics.forEach((metric) => {
    const key = `${metric.method} ${metric.endpoint}`;
    const existing = endpointStats.get(key) || { totalDuration: 0, count: 0 };
    existing.totalDuration += metric.duration;
    existing.count += 1;
    endpointStats.set(key, existing);
  });

  // Yavaş endpoint'leri bul
  const slowEndpoints = Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      avgDuration: stats.totalDuration / stats.count,
      count: stats.count,
    }))
    .filter((stat) => stat.avgDuration > 1000)
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 10);

  return {
    averageResponseTime,
    totalRequests: performanceMetrics.length,
    slowEndpoints,
  };
}

/**
 * Health check metrics
 */
export function getHealthMetrics(): {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: ReturnType<typeof getPerformanceMetrics>;
} {
  const memUsage = process.memoryUsage();
  const performance = getPerformanceMetrics();

  return {
    uptime: process.uptime(),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    performance,
  };
}

