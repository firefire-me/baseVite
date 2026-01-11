<script setup lang="ts">
import { ref, onMounted } from "vue";

const username = ref("");
const token = ref("");

onMounted(() => {
  const storedUsername = localStorage.getItem("username");
  const storedToken = localStorage.getItem("token");
  if (storedUsername) {
    username.value = storedUsername;
  }
  if (storedToken) {
    token.value = storedToken;
  }
});
</script>

<template>
  <a-card title="欢迎使用" :bordered="false" style="margin-top: 20px">
    <a-descriptions bordered :column="2">
      <a-descriptions-item label="用户名">{{ username }}</a-descriptions-item>
      <a-descriptions-item label="状态">已登录</a-descriptions-item>
      <a-descriptions-item label="token">{{ token }}</a-descriptions-item>
      <a-descriptions-item label="登录时间">{{
        new Date().toLocaleString()
      }}</a-descriptions-item>
    </a-descriptions>
    <div style="margin-top: 20px">
      <a-alert message="登录成功" type="success" show-icon />
    </div>
  </a-card>
</template>
