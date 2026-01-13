<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";

const router = useRouter();
const route = useRoute();
const username = ref("");
const token = ref("");
const selectedKeys = ref(["1"]);

onMounted(() => {
  const storedUsername = localStorage.getItem("username");
  const storedToken = localStorage.getItem("token");
  if (storedUsername) {
    username.value = storedUsername;
  }
  if (storedToken) {
    token.value = storedToken;
  }
  // 初始化选中的菜单项
  updateSelectedKeys();
});

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  () => {
    updateSelectedKeys();
  }
);

// 更新选中的菜单项
const updateSelectedKeys = () => {
  if (route.path === "/home") {
    selectedKeys.value = ["1"];
  } else if (route.path === "/home/profile") {
    selectedKeys.value = ["2"];
  } else if (route.path === "/home/task-center") {
    selectedKeys.value = ["4"];
  }
};

// 导航到首页
const navigateToHome = () => {
  router.push("/home");
};

// 导航到任务中心
const navigateToTaskCenter = () => {
  router.push("/home/task-center");
};

// 导航到个人中心
const navigateToProfile = () => {
  router.push("/home/profile");
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  message.success("退出登录成功");
  router.push("/login");
};
</script>

<template>
  <div class="home-container">
    <a-layout class="layout">
      <a-layout-header>
        <div class="logo">欢迎首页</div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :style="{ lineHeight: '64px' }"
          :selected-keys="selectedKeys"
        >
          <a-menu-item key="1" @click="navigateToHome">首页</a-menu-item>
          <a-menu-item key="2" @click="navigateToProfile">个人中心</a-menu-item>
          <a-menu-item key="4" @click="navigateToTaskCenter"
            >任务中心</a-menu-item
          >
          <a-menu-item key="5" @click="handleLogout" style="float: right"
            >退出登录</a-menu-item
          >
          <a-menu-item key="6" style="float: right">{{ username }}</a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content style="padding: 0 50px">
        <div class="content-container">
          <!-- 路由视图，用于显示子路由内容 -->
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<style scoped lang="less">
.home-container {
  width: 100%;
  height: 100vh;
  background-color: #f0f2f5;
}

.logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 24px 16px 0;
  float: left;
  color: white;
  line-height: 31px;
  text-align: center;
  font-weight: bold;
}

.content-container {
  background: #fff;
  padding: 24px;
  margin: 24px 0;
  min-height: 280px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}
</style>
