// 监测数据收集和上报模块

import { performanceMonitor } from './performance-monitor';
import type { PerformanceMetrics, ResourceMetrics } from './performance-monitor';
import { whiteScreenMonitor } from './white-screen-monitor';
import type { WhiteScreenEvent } from './white-screen-monitor';

/**
 * 监测数据类型
 */
export interface MonitorData {
  // 基本信息
  timestamp: number;
  url: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  networkType: string;

  // 性能数据
  performance?: Partial<PerformanceMetrics>;
  resourceMetrics?: ResourceMetrics[];

  // 白屏数据
  whiteScreenEvents?: WhiteScreenEvent[];

  // 路由数据
  routeData?: {
    from?: string;
    to?: string;
    duration?: number;
  };

  // 错误数据
  errors?: {
    type: string;
    message: string;
    stack?: string;
    timestamp: number;
  }[];

  // 自定义数据
  customData?: Record<string, any>;
}

/**
 * 上报配置
 */
export interface ReportConfig {
  batchSize: number; // 批量上报大小
  batchInterval: number; // 批量上报间隔（毫秒）
  reportUrl: string; // 上报 URL
  enableConsole: boolean; // 启用控制台输出
  enableLocalStorage: boolean; // 启用本地存储
  localStorageKey: string; // 本地存储键
  maxLocalStorageSize: number; // 本地存储最大数据量
  onReport: (data: MonitorData[]) => void; // 上报回调
}

/**
 * 监测报告类
 */
export class MonitorReport {
  private config: ReportConfig;
  private dataQueue: MonitorData[] = [];
  private batchTimer: number | null = null;
  private isInitialized: boolean = false;

  /**
   * 构造函数
   */
  constructor(config?: Partial<ReportConfig>) {
    this.config = {
      batchSize: 10, // 默认批量大小
      batchInterval: 5000, // 默认 5 秒间隔
      reportUrl: '', // 默认空 URL
      enableConsole: true, // 默认启用控制台
      enableLocalStorage: true, // 默认启用本地存储
      localStorageKey: 'monitor_data', // 默认存储键
      maxLocalStorageSize: 100, // 默认最大 100 条
      onReport: () => {}, // 默认空回调
      ...config
    };

    this.init();
  }

  /**
   * 初始化
   */
  private init() {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // 加载本地存储数据
    this.loadFromLocalStorage();

    // 开始批量上报定时器
    this.startBatchTimer();

    // 监听白屏事件
    whiteScreenMonitor.config.onWhiteScreen = (event) => {
      this.addWhiteScreenEvent(event);
    };

    whiteScreenMonitor.config.onRecovery = (event) => {
      this.addWhiteScreenEvent(event);
    };

    // 监听错误事件
    this.listenToErrors();
  }

  /**
   * 开始批量上报定时器
   */
  private startBatchTimer() {
    this.batchTimer = window.setInterval(() => {
      if (this.dataQueue.length > 0) {
        this.report();
      }
    }, this.config.batchInterval);
  }

  /**
   * 加载本地存储数据
   */
  private loadFromLocalStorage() {
    if (!this.config.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data)) {
          this.dataQueue = [...this.dataQueue, ...data];
          // 限制数据量
          if (this.dataQueue.length > this.config.maxLocalStorageSize) {
            this.dataQueue = this.dataQueue.slice(-this.config.maxLocalStorageSize);
          }
        }
      }
    } catch (error) {
      console.error('加载本地存储数据失败:', error);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage() {
    if (!this.config.enableLocalStorage) return;

    try {
      const dataToStore = this.dataQueue.slice(-this.config.maxLocalStorageSize);
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  /**
   * 监听错误事件
   */
  private listenToErrors() {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.addError({
        type: 'error',
        message: event.message || '未知错误',
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // 监听未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        type: 'unhandledrejection',
        message: event.reason?.message || 'Promise 错误',
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });
  }

  /**
   * 获取网络类型
   */
  private getNetworkType(): string {
    if (navigator && navigator.connection) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * 创建基础数据
   */
  private createBaseData(): Partial<MonitorData> {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      networkType: this.getNetworkType(),
    };
  }

  /**
   * 添加性能数据
   */
  addPerformanceData() {
    const data: MonitorData = {
      ...this.createBaseData(),
      performance: performanceMonitor.getMetrics(),
      resourceMetrics: performanceMonitor.getResourceMetrics(),
    } as MonitorData;

    this.addData(data);
  }

  /**
   * 添加白屏事件
   */
  addWhiteScreenEvent(event: WhiteScreenEvent) {
    const data: MonitorData = {
      ...this.createBaseData(),
      whiteScreenEvents: [event],
    } as MonitorData;

    this.addData(data);
  }

  /**
   * 添加路由数据
   */
  addRouteData(from: string, to: string, duration: number) {
    const data: MonitorData = {
      ...this.createBaseData(),
      routeData: {
        from,
        to,
        duration,
      },
    } as MonitorData;

    this.addData(data);
  }

  /**
   * 添加错误数据
   */
  addError(error: {
    type: string;
    message: string;
    stack?: string;
    timestamp: number;
  }) {
    const data: MonitorData = {
      ...this.createBaseData(),
      errors: [error],
    } as MonitorData;

    this.addData(data);
  }

  /**
   * 添加自定义数据
   */
  addCustomData(customData: Record<string, any>) {
    const data: MonitorData = {
      ...this.createBaseData(),
      customData,
    } as MonitorData;

    this.addData(data);
  }

  /**
   * 添加数据到队列
   */
  addData(data: MonitorData) {
    this.dataQueue.push(data);

    // 检查是否达到批量大小
    if (this.dataQueue.length >= this.config.batchSize) {
      this.report();
    }

    // 保存到本地存储
    this.saveToLocalStorage();

    // 控制台输出
    if (this.config.enableConsole) {
      console.log('监测数据:', data);
    }
  }

  /**
   * 上报数据
   */
  report() {
    if (this.dataQueue.length === 0) return;

    const dataToReport = [...this.dataQueue];
    this.dataQueue = [];

    // 清空本地存储
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(this.config.localStorageKey);
    }

    // 执行上报回调
    this.config.onReport(dataToReport);

    // 控制台输出
    if (this.config.enableConsole) {
      console.log('上报监测数据:', dataToReport);
    }

    // 发送到服务器
    if (this.config.reportUrl) {
      this.sendToServer(dataToReport);
    }
  }

  /**
   * 发送到服务器
   */
  private sendToServer(data: MonitorData[]) {
    try {
      fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('上报成功:', data);
      })
      .catch(error => {
        console.error('上报失败:', error);
        // 失败后重新加入队列
        this.dataQueue = [...this.dataQueue, ...data];
        this.saveToLocalStorage();
      });
    } catch (error) {
      console.error('上报失败:', error);
      // 失败后重新加入队列
      this.dataQueue = [...this.dataQueue, ...data];
      this.saveToLocalStorage();
    }
  }

  /**
   * 获取队列大小
   */
  getQueueSize(): number {
    return this.dataQueue.length;
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.dataQueue = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(this.config.localStorageKey);
    }
  }

  /**
   * 停止
   */
  stop() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * 启动
   */
  start() {
    this.startBatchTimer();
  }
}

// 导出单例
export const monitorReport = new MonitorReport({
  batchSize: 10,
  batchInterval: 5000,
  reportUrl: '', // 这里可以配置实际的上报地址
  enableConsole: true,
  enableLocalStorage: true,
  localStorageKey: 'monitor_data',
  maxLocalStorageSize: 100,
  onReport: (data) => {
    // 这里可以添加自定义的上报逻辑
    console.log('上报数据:', data.length, '条');
  }
});

// 导出工具函数
export function reportPerformance() {
  monitorReport.addPerformanceData();
}

export function reportRouteData(from: string, to: string, duration: number) {
  monitorReport.addRouteData(from, to, duration);
}

export function reportError(error: {
  type: string;
  message: string;
  stack?: string;
  timestamp: number;
}) {
  monitorReport.addError(error);
}

export function reportCustomData(customData: Record<string, any>) {
  monitorReport.addCustomData(customData);
}
