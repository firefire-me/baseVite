<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref(["home"]);
const username = ref("");
const avatarUrl = ref("");

const iconMap: Record<string, any> = {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
};

const menuItems = computed(() => {
  const homeRoute = router.options.routes.find((r: any) => r.path === "/home");
  if (!homeRoute || !homeRoute.children) return [];

  return homeRoute.children
    .filter((child: any) => child.meta?.title)
    .map((child: any) => ({
      key: child.meta.key,
      icon: child.meta.icon,
      label: child.meta.title,
      path: `/home/${child.path}`,
    }));
});

onMounted(() => {
  const storedUsername = localStorage.getItem("username");
  const storedAvatar = localStorage.getItem("avatar");
  if (storedUsername) {
    username.value = storedUsername;
  }
  if (storedAvatar) {
    avatarUrl.value = storedAvatar;
  }
  updateSelectedKeys();
});

watch(
  () => route.path,
  () => {
    updateSelectedKeys();
  }
);

const updateSelectedKeys = () => {
  const sortedMenuItems = [...menuItems.value].sort(
    (a, b) => b.path.length - a.path.length
  );
  const matchedItem = sortedMenuItems.find((item) =>
    route.path.startsWith(item.path)
  );
  if (matchedItem) {
    selectedKeys.value = [matchedItem.key];
  }
};

const handleMenuClick = ({ key }: { key: string }) => {
  const menuItem = menuItems.value.find((item) => item.key === key);
  if (menuItem) {
    router.push(menuItem.path);
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("avatar");
  message.success("退出登录成功");
  router.push("/login");
};

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};
</script>

<template>
  <a-layout class="main-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="sider"
    >
      <div class="logo">
        <span v-if="!collapsed">管理系统</span>
        <span v-else>MS</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <template #icon>
            <component :is="iconMap[item.icon]" />
          </template>
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="trigger"
            @click="toggleCollapsed"
          />
          <MenuFoldOutlined v-else class="trigger" @click="toggleCollapsed" />
        </div>
        <div class="header-right">
          <a-dropdown>
            <a class="user-dropdown" @click.prevent>
              <a-avatar v-if="avatarUrl" :src="avatarUrl" />
              <a-avatar v-else>
                <UserOutlined />
              </a-avatar>
              <span class="username">{{ username }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item
                  key="profile"
                  @click="router.push('/home/profile')"
                >
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped lang="less">
.main-layout {
  min-height: 100vh;

  .sider {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    overflow-y: auto;
    overflow-x: hidden;

    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 20px;
      font-weight: bold;
      transition: all 0.3s;
    }
  }

  .header {
    background: white;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    position: sticky;
    top: 0;
    z-index: 9;

    .header-left {
      display: flex;
      align-items: center;

      .trigger {
        font-size: 18px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;

      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 4px;
        transition: background 0.3s;

        &:hover {
          background: #f5f5f5;
        }

        .username {
          font-size: 14px;
        }
      }
    }
  }

  .content {
    margin-left: 200px;
    transition: margin-left 0.2s;
    background: #f0f2f5;
    height: calc(100vh - 64px);
    overflow-y: auto;
    overflow-x: hidden;

    .content-wrapper {
      padding: 24px;
      min-height: 100%;
    }
  }
}

.main-layout:has(.sider.ant-layout-sider-collapsed) {
  .content {
    margin-left: 80px;
  }
}
</style>
