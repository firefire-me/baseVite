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
    const navEntry = navigationEntry as any;
    this.metrics.navigationStart = navEntry.navigationStart;
    this.metrics.unloadEventStart = navEntry.unloadEventStart || 0;
    this.metrics.unloadEventEnd = navEntry.unloadEventEnd || 0;
    this.metrics.redirectStart = navEntry.redirectStart || 0;
    this.metrics.redirectEnd = navEntry.redirectEnd || 0;
    this.metrics.fetchStart = navEntry.fetchStart;
    this.metrics.domainLookupStart = navEntry.domainLookupStart;
    this.metrics.domainLookupEnd = navEntry.domainLookupEnd;
    this.metrics.connectStart = navEntry.connectStart;
    this.metrics.connectEnd = navEntry.connectEnd;
    this.metrics.secureConnectionStart = navEntry.secureConnectionStart || 0;
    this.metrics.requestStart = navEntry.requestStart;
    this.metrics.responseStart = navEntry.responseStart;
    this.metrics.responseEnd = navEntry.responseEnd;
    this.metrics.domLoading = navEntry.domLoading;
    this.metrics.domInteractive = navEntry.domInteractive;
    this.metrics.domContentLoadedEventStart = navEntry.domContentLoadedEventStart;
    this.metrics.domContentLoadedEventEnd = navEntry.domContentLoadedEventEnd;
    this.metrics.domComplete = navEntry.domComplete;
    this.metrics.loadEventStart = navEntry.loadEventStart || 0;
    this.metrics.loadEventEnd = navEntry.loadEventEnd || 0;

    // 计算指标
    this.metrics.ttfb = navEntry.responseStart - navEntry.fetchStart;
    this.metrics.domReady = navEntry.domContentLoadedEventEnd - navEntry.navigationStart;
    this.metrics.onLoad = navEntry.loadEventEnd - navEntry.navigationStart;
    this.metrics.redirectTime = navEntry.redirectEnd - navEntry.redirectStart;
    this.metrics.dnsTime = navEntry.domainLookupEnd - navEntry.domainLookupStart;
    this.metrics.tcpTime = navEntry.connectEnd - navEntry.connectStart;
    this.metrics.sslTime = navEntry.secureConnectionStart ? navEntry.connectEnd - navEntry.secureConnectionStart : 0;
    this.metrics.requestTime = navEntry.responseStart - navEntry.requestStart;
    this.metrics.responseTime = navEntry.responseEnd - navEntry.responseStart;
    this.metrics.domParseTime = navEntry.domInteractive - navEntry.domLoading;
    this.metrics.resourcesLoadTime = navEntry.loadEventStart - navEntry.domContentLoadedEventEnd;
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
          const resourceEntry = entry as any;
          this.resourceMetrics.push({
            name: entry.name,
            initiatorType: resourceEntry.initiatorType,
            duration: entry.duration,
            transferSize: resourceEntry.transferSize,
            encodedBodySize: resourceEntry.encodedBodySize,
            decodedBodySize: resourceEntry.decodedBodySize,
            startTime: entry.startTime,
            responseEnd: resourceEntry.responseEnd
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


