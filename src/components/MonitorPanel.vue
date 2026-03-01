<template>
  <div class="monitor-panel">
    <a-card title="性能监测面板" :bordered="false" class="panel-card">
      <a-tabs v-model:active-key="activeKey">
        <!-- 性能指标 -->
        <a-tab-pane key="performance" tab="性能指标">
          <div class="metrics-grid">
            <a-statistic 
              v-for="(metric, key) in displayMetrics" 
              :key="key"
              :title="metric.label"
              :value="metric.value"
              :value-style="{ color: getMetricColor(metric.value, metric.threshold) }"
              class="metric-item"
            >
              <template #suffix>{{ metric.unit }}</template>
            </a-statistic>
          </div>
          
          <a-divider orientation="left">详细指标</a-divider>
          <a-table :columns="performanceColumns" :data-source="detailedMetrics" size="small" />
        </a-tab-pane>
        
        <!-- 白屏监测 -->
        <a-tab-pane key="white-screen" tab="白屏监测">
          <a-list
            v-if="whiteScreenEvents.length > 0"
            item-layout="vertical"
            :data-source="whiteScreenEvents"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.isWhiteScreen ? '白屏事件' : '页面恢复'"
                  :description="`时间: ${new Date(item.startTime).toLocaleString()}`"
                />
                <div>
                  <p>持续时间: {{ item.duration }}ms</p>
                  <p v-if="item.error" style="color: #f5222d">错误: {{ item.error }}</p>
                </div>
              </a-list-item>
            </template>
          </a-list>
          <a-empty v-else description="暂无白屏事件" />
        </a-tab-pane>
        
        <!-- 资源加载 -->
        <a-tab-pane key="resources" tab="资源加载">
          <a-table :columns="resourceColumns" :data-source="resourceMetrics" size="small" :scroll="{ x: 800 }">
            <template #column:duration="{ text }">
              {{ formatNumber(text) }}ms
            </template>
            <template #column:transferSize="{ text }">
              {{ formatSize(text) }}
            </template>
            <template #column:encodedBodySize="{ text }">
              {{ formatSize(text) }}
            </template>
            <template #column:decodedBodySize="{ text }">
              {{ formatSize(text) }}
            </template>
          </a-table>
        </a-tab-pane>
        
        <!-- 配置 -->
        <a-tab-pane key="config" tab="配置">
          <a-form layout="vertical">
            <a-form-item label="刷新间隔">
              <a-slider v-model:value="refreshInterval" :min="1000" :max="30000" :step="1000" />
              <div class="slider-value">{{ refreshInterval }}ms</div>
            </a-form-item>
            <a-form-item>
              <a-checkbox v-model:checked="autoRefresh">自动刷新</a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="refreshData">手动刷新</a-button>
              <a-button style="margin-left: 8px" @click="exportData">导出数据</a-button>
              <a-button danger style="margin-left: 8px" @click="clearData">清空数据</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { performanceMonitor } from '../monitor/performance-monitor';
import { whiteScreenMonitor } from '../monitor/white-screen-monitor';
import { monitorReport } from '../monitor/monitor-report';

// 响应式数据
const activeKey = ref('performance');
const refreshInterval = ref(5000);
const autoRefresh = ref(true);
const whiteScreenEvents = ref<any[]>([]);
const refreshTimer = ref<number | null>(null);

// 计算属性
const performanceData = computed(() => performanceMonitor.getMetrics());
const resourceMetrics = computed(() => performanceMonitor.getResourceMetrics());

// 显示指标
const displayMetrics = computed(() => {
  return [
    {
      label: 'TTFB',
      value: performanceData.value.ttfb || 0,
      unit: 'ms',
      threshold: 300
    },
    {
      label: 'FCP',
      value: performanceData.value.fcp || 0,
      unit: 'ms',
      threshold: 1000
    },
    {
      label: 'LCP',
      value: performanceData.value.lcp || 0,
      unit: 'ms',
      threshold: 2500
    },
    {
      label: 'DOM 准备',
      value: performanceData.value.domReady || 0,
      unit: 'ms',
      threshold: 2000
    },
    {
      label: '页面加载',
      value: performanceData.value.onLoad || 0,
      unit: 'ms',
      threshold: 3000
    },
    {
      label: 'DNS 解析',
      value: performanceData.value.dnsTime || 0,
      unit: 'ms',
      threshold: 100
    },
    {
      label: 'TCP 连接',
      value: performanceData.value.tcpTime || 0,
      unit: 'ms',
      threshold: 200
    },
    {
      label: 'SSL 握手',
      value: performanceData.value.sslTime || 0,
      unit: 'ms',
      threshold: 300
    }
  ];
});

// 详细指标
const detailedMetrics = computed(() => {
  return Object.entries(performanceData.value).map(([key, value]) => {
    return {
      key,
      name: getMetricLabel(key),
      value: typeof value === 'number' ? value.toFixed(2) : value,
      unit: getMetricUnit(key)
    };
  });
});

// 性能指标列
const performanceColumns = [
  { title: '指标名', dataIndex: 'name', key: 'name' },
  { title: '值', dataIndex: 'value', key: 'value' },
  { title: '单位', dataIndex: 'unit', key: 'unit' }
];

// 资源指标列
const resourceColumns = [
  { title: '资源名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '类型', dataIndex: 'initiatorType', key: 'initiatorType' },
  { title: '加载时间', dataIndex: 'duration', key: 'duration' },
  { title: '传输大小', dataIndex: 'transferSize', key: 'transferSize' },
  { title: '压缩大小', dataIndex: 'encodedBodySize', key: 'encodedBodySize' },
  { title: '解压大小', dataIndex: 'decodedBodySize', key: 'decodedBodySize' }
];

// 方法
const getMetricLabel = (key: string): string => {
  const labels: Record<string, string> = {
    ttfb: 'TTFB (首字节时间)',
    fcp: 'FCP (首次内容绘制)',
    lcp: 'LCP (最大内容绘制)',
    domReady: 'DOM 准备完成时间',
    onLoad: '页面完全加载时间',
    redirectTime: '重定向时间',
    dnsTime: 'DNS 解析时间',
    tcpTime: 'TCP 连接时间',
    sslTime: 'SSL 握手时间',
    requestTime: '请求时间',
    responseTime: '响应时间',
    domParseTime: 'DOM 解析时间',
    resourcesLoadTime: '资源加载时间'
  };
  return labels[key] || key;
};

const getMetricUnit = (key: string): string => {
  const timeMetrics = ['ttfb', 'fcp', 'lcp', 'domReady', 'onLoad', 'redirectTime', 'dnsTime', 'tcpTime', 'sslTime', 'requestTime', 'responseTime', 'domParseTime', 'resourcesLoadTime'];
  return timeMetrics.includes(key) ? 'ms' : '';
};

const getMetricColor = (value: number, threshold: number): string => {
  if (value < threshold * 0.5) return '#52c41a'; // 绿色
  if (value < threshold) return '#faad14'; // 黄色
  return '#f5222d'; // 红色
};

const formatNumber = (value: number): string => {
  return value.toFixed(2);
};

const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};



const refreshData = () => {
  // 刷新白屏事件数据
  // 这里可以从 monitorReport 中获取白屏事件数据
  // 暂时使用模拟数据
  whiteScreenEvents.value = [
    {
      startTime: Date.now() - 3600000,
      endTime: Date.now() - 3598000,
      duration: 2000,
      isWhiteScreen: true,
      error: '页面内容未加载'
    },
    {
      startTime: Date.now() - 1800000,
      endTime: Date.now() - 1799000,
      duration: 1000,
      isWhiteScreen: false
    }
  ];
};

const exportData = () => {
  const data = {
    performance: performanceData.value,
    resources: resourceMetrics.value,
    whiteScreenEvents: whiteScreenEvents.value,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `monitor-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const clearData = () => {
  whiteScreenEvents.value = [];
  performanceMonitor.reset();
};

const startAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
  }
  
  refreshTimer.value = window.setInterval(() => {
    if (autoRefresh.value) {
      refreshData();
    }
  }, refreshInterval.value);
};

// 生命周期
onMounted(() => {
  refreshData();
  startAutoRefresh();
});

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
  }
});
</script>

<style scoped>
.monitor-panel {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 500px;
}

.panel-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.slider-value {
  margin-top: 8px;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .metric-item {
    padding: 12px;
  }
}
</style>
