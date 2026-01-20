<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getTasks } from "@/api/task/index";
import StatCard from "@/components/StatCard.vue";
import {
  PlusOutlined,
  UnorderedListOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons-vue";

const username = ref("");
const loading = ref(false);

const stats = ref({
  total: 0,
  completed: 0,
  pending: 0,
  completionRate: 0,
});

const recentTasks = ref<any[]>([]);
const activities = ref([
  { id: 1, type: "create", content: "创建了新任务", time: "10分钟前" },
  { id: 2, type: "complete", content: "完成了任务", time: "30分钟前" },
  { id: 3, type: "update", content: "更新了任务状态", time: "1小时前" },
  { id: 4, type: "delete", content: "删除了任务", time: "2小时前" },
]);

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await getTasks({ limit: 100 });
    const tasks = response.data;

    stats.value.total = tasks.length;
    stats.value.completed = tasks.filter((t: any) => t.isCompleted).length;
    stats.value.pending = tasks.filter((t: any) => !t.isCompleted).length;
    stats.value.completionRate =
      stats.value.total > 0
        ? Math.round((stats.value.completed / stats.value.total) * 100)
        : 0;

    recentTasks.value = tasks.slice(0, 5);
  } catch (error) {
    console.error("Failed to load stats:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    username.value = storedUsername;
  }
  loadStats();
});

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    create: "#52c41a",
    complete: "#1890ff",
    update: "#faad14",
    delete: "#ff4d4f",
  };
  return colors[type] || "#8c8c8c";
};
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1>欢迎回来，{{ username }}！</h1>
      <p>这是您的任务管理概览</p>
    </div>

    <a-row :gutter="[16, 16]" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="任务总数"
          :value="stats.total"
          icon="dashboard"
          color="#1890ff"
          :trend="12"
        />
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="已完成"
          :value="stats.completed"
          icon="checkCircle"
          color="#52c41a"
          :trend="8"
        />
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="待完成"
          :value="stats.pending"
          icon="clockCircle"
          color="#faad14"
          :trend="-5"
        />
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="完成率"
          :value="stats.completionRate"
          icon="percentage"
          color="#722ed1"
          suffix="%"
          :trend="3"
        />
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" class="content-row">
      <a-col :xs="24" :lg="16">
        <a-card title="最近任务" :bordered="false" :loading="loading">
          <template #extra>
            <a-button type="link" @click="$router.push('/home/task-center')">
              查看全部
            </a-button>
          </template>
          <a-list :data-source="recentTasks" :split="false">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar
                      :style="{
                        backgroundColor: item.isCompleted
                          ? '#52c41a'
                          : '#faad14',
                      }"
                    >
                      {{ item.title.charAt(0).toUpperCase() }}
                    </a-avatar>
                  </template>
                  <template #title>
                    <span
                      :style="{
                        textDecoration: item.isCompleted
                          ? 'line-through'
                          : 'none',
                        color: item.isCompleted ? '#8c8c8c' : 'inherit',
                      }"
                    >
                      {{ item.title }}
                    </span>
                  </template>
                  <template #description>
                    <a-tag :color="item.isCompleted ? 'success' : 'warning'">
                      {{ item.isCompleted ? "已完成" : "进行中" }}
                    </a-tag>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
            <template #empty>
              <a-empty description="暂无任务" />
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="最近活动" :bordered="false">
          <a-timeline>
            <a-timeline-item
              v-for="activity in activities"
              :key="activity.id"
              :color="getActivityColor(activity.type)"
            >
              <div class="activity-item">
                <div class="activity-content">{{ activity.content }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" class="quick-actions-row">
      <a-col :span="24">
        <a-card title="快捷操作" :bordered="false">
          <a-space :size="16" wrap>
            <a-button
              type="primary"
              size="large"
              @click="$router.push('/home/task-center')"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              新建任务
            </a-button>
            <a-button size="large" @click="$router.push('/home/task-center')">
              <template #icon>
                <UnorderedListOutlined />
              </template>
              查看任务
            </a-button>
            <a-button size="large" @click="$router.push('/home/profile')">
              <template #icon>
                <UserOutlined />
              </template>
              个人中心
            </a-button>
            <a-button size="large" @click="$router.push('/home/task-center')">
              <template #icon>
                <BarChartOutlined />
              </template>
              数据统计
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="less">
.dashboard-container {
  .welcome-section {
    margin-bottom: 24px;

    h1 {
      font-size: 28px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      margin: 0;
    }
  }

  .stats-row {
    margin-bottom: 24px;
  }

  .content-row {
    margin-bottom: 24px;
  }

  .activity-item {
    .activity-content {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 4px;
    }

    .activity-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .quick-actions-row {
    :deep(.ant-btn) {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 24px;
      font-size: 16px;
    }
  }
}
</style>
