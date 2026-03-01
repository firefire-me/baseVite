// 性能监测模块

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  // 页面加载指标
  navigationStart: number;
  unloadEventStart: number;
  unloadEventEnd: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;

  // 计算指标
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  domReady: number; // DOM 准备完成时间
  onLoad: number; // 页面完全加载时间
  redirectTime: number; // 重定向时间
  dnsTime: number; // DNS 解析时间
  tcpTime: number; // TCP 连接时间
  sslTime: number; // SSL 握手时间
  requestTime: number; // 请求时间
  responseTime: number; // 响应时间
  domParseTime: number; // DOM 解析时间
  resourcesLoadTime: number; // 资源加载时间
}

/**
 * 资源性能指标
 */
export interface ResourceMetrics {
  name: string;
  initiatorType: string;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  startTime: number;
  responseEnd: number;
}

/**
 * 性能监测类
 */
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private resourceMetrics: ResourceMetrics[] = [];
  private lcpObserver: PerformanceObserver | null = null;
  private fcpObserver: PerformanceObserver | null = null;

  /**
   * 开始监测
   */
  start() {
    // 监测 Navigation Timing
    this.monitorNavigationTiming();
    
    // 监测 LCP 和 FCP
    this.monitorPaintMetrics();
    
    // 监测资源加载
    this.monitorResourceTiming();
  }

  /**
   * 监测导航时序
   */
  private monitorNavigationTiming() {
    if (typeof performance === 'undefined') return;

    // 监听 load 事件
    window.addEventListener('load', () => {
      this.collectNavigationTiming();
    });

    // 监听 DOMContentLoaded 事件
    window.addEventListener('DOMContentLoaded', () => {
      this.collectNavigationTiming();
    });
  }

  /**
   * 收集导航时序数据
   */
  private collectNavigationTiming() {
    if (typeof performance === 'undefined') return;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigationEntry) return;

    // 原始指标
    this.metrics.navigationStart = navigationEntry.navigationStart;
    this.metrics.unloadEventStart = navigationEntry.unloadEventStart;
    this.metrics.unloadEventEnd = navigationEntry.unloadEventEnd;
    this.metrics.redirectStart = navigationEntry.redirectStart;
    this.metrics.redirectEnd = navigationEntry.redirectEnd;
    this.metrics.fetchStart = navigationEntry.fetchStart;
    this.metrics.domainLookupStart = navigationEntry.domainLookupStart;
    this.metrics.domainLookupEnd = navigationEntry.domainLookupEnd;
    this.metrics.connectStart = navigationEntry.connectStart;
    this.metrics.connectEnd = navigationEntry.connectEnd;
    this.metrics.secureConnectionStart = navigationEntry.secureConnectionStart;
    this.metrics.requestStart = navigationEntry.requestStart;
    this.metrics.responseStart = navigationEntry.responseStart;
    this.metrics.responseEnd = navigationEntry.responseEnd;
    this.metrics.domLoading = navigationEntry.domLoading;
    this.metrics.domInteractive = navigationEntry.domInteractive;
    this.metrics.domContentLoadedEventStart = navigationEntry.domContentLoadedEventStart;
    this.metrics.domContentLoadedEventEnd = navigationEntry.domContentLoadedEventEnd;
    this.metrics.domComplete = navigationEntry.domComplete;
    this.metrics.loadEventStart = navigationEntry.loadEventStart;
    this.metrics.loadEventEnd = navigationEntry.loadEventEnd;

    // 计算指标
    this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    this.metrics.domReady = navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart;
    this.metrics.onLoad = navigationEntry.loadEventEnd - navigationEntry.navigationStart;
    this.metrics.redirectTime = navigationEntry.redirectEnd - navigationEntry.redirectStart;
    this.metrics.dnsTime = navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart;
    this.metrics.tcpTime = navigationEntry.connectEnd - navigationEntry.connectStart;
    this.metrics.sslTime = navigationEntry.secureConnectionStart > 0 ? 
      navigationEntry.connectEnd - navigationEntry.secureConnectionStart : 0;
    this.metrics.requestTime = navigationEntry.responseStart - navigationEntry.requestStart;
    this.metrics.responseTime = navigationEntry.responseEnd - navigationEntry.responseStart;
    this.metrics.domParseTime = navigationEntry.domInteractive - navigationEntry.domLoading;
    this.metrics.resourcesLoadTime = navigationEntry.loadEventStart - navigationEntry.domContentLoadedEventEnd;
  }

  /**
   * 监测绘制指标 (FCP, LCP)
   */
  private monitorPaintMetrics() {
    if (typeof performance === 'undefined' || !('PerformanceObserver' in window)) return;

    // 监测 FCP
    this.fcpObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
      });
    });

    this.fcpObserver.observe({ type: 'paint', buffered: true });

    // 监测 LCP
    this.lcpObserver = new PerformanceObserver((entries) => {
      const lcpEntry = entries.getEntries()[entries.getEntries().length - 1];
      if (lcpEntry) {
        this.metrics.lcp = lcpEntry.startTime;
      }
    });

    this.lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /**
   * 监测资源加载
   */
  private monitorResourceTiming() {
    if (typeof performance === 'undefined' || !('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          this.resourceMetrics.push({
            name: entry.name,
            initiatorType: entry.initiatorType,
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            startTime: entry.startTime,
            responseEnd: entry.responseEnd
          });
        }
      });
    });

    resourceObserver.observe({ type: 'resource', buffered: true });
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return this.metrics;
  }

  /**
   * 获取资源性能指标
   */
  getResourceMetrics(): ResourceMetrics[] {
    return this.resourceMetrics;
  }

  /**
   * 停止监测
   */
  stop() {
    if (this.lcpObserver) {
      this.lcpObserver.disconnect();
      this.lcpObserver = null;
    }

    if (this.fcpObserver) {
      this.fcpObserver.disconnect();
      this.fcpObserver = null;
    }
  }

  /**
   * 重置监测
   */
  reset() {
    this.metrics = {};
    this.resourceMetrics = [];
    this.stop();
    this.start();
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor();

// 导出类型
export type { PerformanceMetrics, ResourceMetrics };
