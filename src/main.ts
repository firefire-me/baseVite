import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

// 导入监测模块
import { performanceMonitor } from "./monitor/performance-monitor";
import { whiteScreenMonitor } from "./monitor/white-screen-monitor";
import { monitorReport, reportPerformance } from "./monitor/monitor-report";

// 启动监测
performanceMonitor.start();
whiteScreenMonitor.start();

// 页面加载完成后上报性能数据
window.addEventListener('load', () => {
  reportPerformance();
});

// 页面 DOM 内容加载完成后上报性能数据
window.addEventListener('DOMContentLoaded', () => {
  reportPerformance();
});

const app = createApp(App);
app.use(router);
app.use(Antd);
app.mount("#app");

// 暴露监测模块到全局（可选，方便调试）
if (import.meta.env.DEV) {
  (window as any).$monitor = {
    performance: performanceMonitor,
    whiteScreen: whiteScreenMonitor,
    report: monitorReport
  };
}
