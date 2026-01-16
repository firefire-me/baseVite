<script setup lang="ts">
import { computed } from "vue";
import {
  DashboardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons-vue";

interface Props {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  trend?: number;
  suffix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "#1890ff",
  suffix: "",
});

const trendClass = computed(() => {
  if (props.trend === undefined) return "";
  return props.trend > 0 ? "trend-up" : "trend-down";
});

const trendText = computed(() => {
  if (props.trend === undefined) return "";
  const sign = props.trend > 0 ? "+" : "";
  return `${sign}${props.trend}%`;
});

const iconComponent = computed(() => {
  const icons: Record<string, any> = {
    dashboard: DashboardOutlined,
    checkCircle: CheckCircleOutlined,
    clockCircle: ClockCircleOutlined,
    percentage: PercentageOutlined,
    user: UserOutlined,
    team: TeamOutlined,
    file: FileTextOutlined,
    project: ProjectOutlined,
  };
  return icons[props.icon] || DashboardOutlined;
});
</script>

<template>
  <a-card class="stat-card" :bordered="false" :hoverable="true">
    <div class="stat-content">
      <div
        class="stat-icon"
        :style="{ backgroundColor: color + '20', color: color }"
      >
        <component :is="iconComponent" />
      </div>
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">
          {{ value }}<span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
        </div>
        <div v-if="trend !== undefined" class="stat-trend" :class="trendClass">
          <ArrowUpOutlined v-if="trend > 0" />
          <ArrowDownOutlined v-else />
          <span>{{ trendText }}</span>
          <span class="trend-label">较上周</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<style scoped lang="less">
.stat-card {
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      transition: all 0.3s;
    }

    .stat-info {
      flex: 1;

      .stat-title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        margin-bottom: 4px;

        .stat-suffix {
          font-size: 14px;
          font-weight: normal;
          margin-left: 4px;
          color: rgba(0, 0, 0, 0.45);
        }
      }

      .stat-trend {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        &.trend-up {
          color: #52c41a;
        }

        &.trend-down {
          color: #ff4d4f;
        }

        .trend-label {
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }
  }
}
</style>
