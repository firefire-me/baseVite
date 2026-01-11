<script setup lang="ts">
import { ref, h } from "vue";
import { getTasks, createTask, updateTask, deleteTask } from "@/api/task/index";
import { message, Modal, Form, Input, Button } from "ant-design-vue";

// 任务数据类型
interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

// 任务列表
const tasks = ref<Task[]>([]);
// 加载状态
const loading = ref(false);
// 控制新增任务弹框显示
const isModalVisible = ref(false);
// 表单数据
const formData = ref({
  title: "",
  isCompleted: false,
});

// 加载任务列表
const loadTasks = async () => {
  try {
    loading.value = true;
    const response = await getTasks();

    tasks.value = response.map((item) => ({
      id: item._id,
      title: item.title,
      isCompleted: item.isCompleted,
    }));
  } catch (error) {
    message.error("获取任务列表失败");
    console.error("Failed to get tasks:", error);
  } finally {
    loading.value = false;
  }
};

// 打开新增任务弹框
const showModal = () => {
  isModalVisible.value = true;
};

// 关闭新增任务弹框
const handleCancel = () => {
  isModalVisible.value = false;
  // 重置表单
  formData.value = {
    title: "",
    isCompleted: false,
  };
};

// 提交新增任务
const handleOk = async () => {
  if (!formData.value.title.trim()) {
    message.error("请输入任务名称");
    return;
  }

  try {
    const response = await createTask({
      title: formData.value.title.trim(),
      isCompleted: formData.value.isCompleted,
    });

    message.success("任务添加成功");
    isModalVisible.value = false;

    // 重置表单
    formData.value = {
      title: "",
      isCompleted: false,
    };
    // 刷新任务列表
    loadTasks();
  } catch (error) {
    message.error("任务添加失败");
    console.error("Failed to create task:", error);
  }
};

// 更新任务完成状态
const handleStatusChange = async (id: string, isCompleted: boolean) => {
  try {
    await updateTask(id, { isCompleted });
    message.success("任务状态更新成功");
  } catch (error) {
    message.error("任务状态更新失败");
    console.error("Failed to update task:", error);
    // 恢复原来的状态
    const task = tasks.value.find((task) => task.id === id);
    if (task) {
      task.isCompleted = !isCompleted;
    }
  }
};

// 删除任务
const handleDelete = async (id: string) => {
  try {
    await deleteTask(id);
    // 从列表中移除任务
    tasks.value = tasks.value.filter((task) => task.id !== id);
    message.success("任务删除成功");
  } catch (error) {
    message.error("任务删除失败");
    console.error("Failed to delete task:", error);
  }
};

// 组件挂载时加载任务列表
loadTasks();

// 定义表格列
const columns = [
  {
    title: "任务名称",
    dataIndex: "title",
    key: "title",
    ellipsis: true,
  },
  {
    title: "是否完成",
    dataIndex: "isCompleted",
    key: "isCompleted",
    customRender: ({ record }: { record: Task }) => {
      return h("input", {
        type: "checkbox",
        checked: record.isCompleted,
        onChange: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const newStatus = target.checked;
          record.isCompleted = newStatus;
          handleStatusChange(record.id, newStatus);
        },
      });
    },
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
    width: 100,
    customRender: ({ record }: { record: Task }) => {
      return h(
        Button,
        {
          type: "primary",
          danger: true,
          size: "small",
          onClick: () => handleDelete(record.id),
        },
        () => "删除"
      );
    },
  },
];
</script>

<template>
  <div class="task-center-container">
    <a-card title="任务中心" :bordered="false" style="margin-top: 20px">
      <template #extra>
        <a-button type="primary" @click="showModal">新增任务</a-button>
      </template>
      <!-- 任务列表 -->
      <a-table
        :columns="columns"
        :data-source="tasks"
        :row-key="(record) => record.id"
        :pagination="false"
        :loading="loading"
        bordered
      />
    </a-card>

    <!-- 新增任务弹框 -->
    <Modal
      v-model:open="isModalVisible"
      title="新增任务"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <Form layout="vertical">
        <Form.Item label="任务名称" required>
          <Input v-model:value="formData.title" placeholder="请输入任务名称" />
        </Form.Item>
        <Form.Item label="是否完成">
          <input type="checkbox" v-model="formData.isCompleted" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped lang="less">
.task-center-container {
  width: 100%;
}
</style>
