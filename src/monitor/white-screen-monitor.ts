// 白屏监测模块

/**
 * 白屏事件类型
 */
export interface WhiteScreenEvent {
  startTime: number; // 白屏开始时间
  endTime: number; // 白屏结束时间（如果有）
  duration: number; // 白屏持续时间
  isWhiteScreen: boolean; // 是否为白屏
  error?: string; // 错误信息
}

/**
 * 白屏监测配置
 */
export interface WhiteScreenMonitorConfig {
  timeout: number; // 白屏超时时间（毫秒）
  checkInterval: number; // 检查间隔（毫秒）
  containerSelector: string; // 监测容器选择器
  ignoreElements: string[]; // 忽略的元素选择器
  onWhiteScreen: (event: WhiteScreenEvent) => void; // 白屏回调
  onRecovery: (event: WhiteScreenEvent) => void; // 恢复回调
}

/**
 * 白屏监测类
 */
export class WhiteScreenMonitor {
  private config: WhiteScreenMonitorConfig;
  private startTime: number | null = null;
  private checkTimer: number | null = null;
  private timeoutTimer: number | null = null;
  private isMonitoring: boolean = false;

  /**
   * 构造函数
   */
  constructor(config?: Partial<WhiteScreenMonitorConfig>) {
    this.config = {
      timeout: 3000, // 默认 3 秒超时
      checkInterval: 100, // 默认 100ms 检查一次
      containerSelector: 'body', // 默认监测 body
      ignoreElements: [], // 默认不忽略任何元素
      onWhiteScreen: () => {}, // 默认空回调
      onRecovery: () => {}, // 默认空回调
      ...config
    };
  }

  /**
   * 开始监测
   */
  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = Date.now();

    // 开始定期检查
    this.checkTimer = window.setInterval(() => {
      this.checkWhiteScreen();
    }, this.config.checkInterval);

    // 设置超时检测
    this.timeoutTimer = window.setTimeout(() => {
      this.checkWhiteScreen(true);
    }, this.config.timeout);

    // 立即检查一次
    this.checkWhiteScreen();
  }

  /**
   * 停止监测
   */
  stop() {
    this.isMonitoring = false;

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * 检查是否白屏
   */
  private checkWhiteScreen(isTimeoutCheck: boolean = false) {
    if (!this.isMonitoring) return;

    const container = document.querySelector(this.config.containerSelector);
    if (!container) {
      this.handleWhiteScreen('容器元素不存在');
      return;
    }

    // 检查容器是否有内容
    const hasContent = this.hasVisibleContent(container);

    if (!hasContent) {
      if (isTimeoutCheck || this.isWhiteScreen()) {
        this.handleWhiteScreen('页面内容未加载');
      }
    } else {
      this.handleRecovery();
    }
  }

  /**
   * 检测元素是否有可见内容
   */
  private hasVisibleContent(element: Element): boolean {
    // 检查元素是否有文本内容
    if (element.textContent && element.textContent.trim()) {
      return true;
    }

    // 检查元素是否有可见的子元素
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;

      // 忽略指定的元素
      if (this.isIgnoredElement(child)) {
        continue;
      }

      // 检查元素是否可见
      if (this.isElementVisible(child)) {
        return true;
      }

      // 递归检查子元素
      if (this.hasVisibleContent(child)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查元素是否被忽略
   */
  private isIgnoredElement(element: HTMLElement): boolean {
    return this.config.ignoreElements.some(selector => {
      try {
        return element.matches(selector);
      } catch {
        return false;
      }
    });
  }

  /**
   * 检查元素是否可见
   */
  private isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const display = style.display;
    const visibility = style.visibility;
    const opacity = parseFloat(style.opacity);
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);

    // 检查元素是否显示
    if (display === 'none' || visibility === 'hidden' || opacity === 0) {
      return false;
    }

    // 检查元素是否有尺寸
    if (width === 0 && height === 0) {
      return false;
    }

    // 检查元素是否在视口中
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  /**
   * 检查是否为白屏
   */
  private isWhiteScreen(): boolean {
    // 检查页面是否有可见内容
    const container = document.querySelector(this.config.containerSelector);
    if (!container) return true;

    return !this.hasVisibleContent(container);
  }

  /**
   * 处理白屏事件
   */
  private handleWhiteScreen(error?: string) {
    if (!this.startTime) return;

    const endTime = Date.now();
    const event: WhiteScreenEvent = {
      startTime: this.startTime,
      endTime: endTime,
      duration: endTime - this.startTime,
      isWhiteScreen: true,
      error
    };

    this.config.onWhiteScreen(event);
  }

  /**
   * 处理恢复事件
   */
  private handleRecovery() {
    if (!this.startTime) return;

    const endTime = Date.now();
    const event: WhiteScreenEvent = {
      startTime: this.startTime,
      endTime: endTime,
      duration: endTime - this.startTime,
      isWhiteScreen: false
    };

    this.config.onRecovery(event);
    this.stop();
  }

  /**
   * 重置监测
   */
  reset() {
    this.stop();
    this.start();
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      startTime: this.startTime,
      isWhiteScreen: this.isWhiteScreen()
    };
  }
}

/**
 * 创建默认的白屏监测实例
 */
export function createWhiteScreenMonitor(config?: Partial<WhiteScreenMonitorConfig>) {
  return new WhiteScreenMonitor(config);
}

// 导出默认实例
export const whiteScreenMonitor = createWhiteScreenMonitor({
  timeout: 3000,
  checkInterval: 100,
  containerSelector: 'body',
  ignoreElements: [
    'script',
    'style',
    'link',
    'meta',
    'title',
    'noscript'
  ],
  onWhiteScreen: (event) => {
    console.warn('白屏检测:', event);
    // 可以在这里上报白屏事件
  },
  onRecovery: (event) => {
    console.info('页面恢复:', event);
    // 可以在这里上报恢复事件
  }
});

// 导出类型
export type { WhiteScreenEvent, WhiteScreenMonitorConfig };
