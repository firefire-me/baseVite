<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import BreadcrumbNav from "./BreadcrumbNav.vue";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  DownOutlined,
  PictureOutlined,
  FileImageOutlined,
  CompressOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);
const username = ref("");
const avatarUrl = ref("");

const iconMap: Record<string, any> = {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
  PictureOutlined,
  FileImageOutlined,
  CompressOutlined,
  EditOutlined,
};

const menuItems = computed(() => {
  const homeRoute = router.options.routes.find((r: any) => r.path === "/home");
  if (!homeRoute || !homeRoute.children) return [];

  const mapRoute = (child: any, parentPath = "/home") => {
    let fullPath = child.path.startsWith("/")
      ? child.path
      : `${parentPath}/${child.path}`.replace(/\/+/g, "/");

    // 移除末尾的斜杠，除非是根路径 "/"
    if (fullPath.length > 1 && fullPath.endsWith("/")) {
      fullPath = fullPath.slice(0, -1);
    }

    const item: any = {
      key: child.meta?.key || child.name,
      icon: child.meta?.icon,
      label: child.meta?.title,
      path: fullPath,
    };

    if (child.children && child.children.length > 0) {
      const children = child.children
        .filter((c: any) => c.meta?.title)
        .map((c: any) => mapRoute(c, fullPath));
      if (children.length > 0) {
        item.children = children;
      }
    }

    return item;
  };

  return homeRoute.children
    .filter((child: any) => child.meta?.title)
    .map((child: any) => mapRoute(child));
});

const updateSelectedKeys = () => {
  const findItem = (items: any[]): any => {
    // 优先搜索子节点（更深层次的匹配）
    for (const item of items) {
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }

      // 获取规范化的路径进行比较
      const normalizedRoutePath = route.path.replace(/\/$/, "") || "/";
      const normalizedItemPath = item.path.replace(/\/$/, "") || "/";

      // 然后搜索当前节点
      if (
        normalizedRoutePath === normalizedItemPath ||
        (normalizedItemPath !== "/home" &&
          normalizedItemPath !== "/" &&
          normalizedRoutePath.startsWith(normalizedItemPath + "/"))
      ) {
        return item;
      }
    }
    return null;
  };

  const matchedItem = findItem(menuItems.value);
  if (matchedItem) {
    selectedKeys.value = [matchedItem.key];
    // Find parent to open
    const findParentKeys = (
      items: any[],
      targetKey: string,
      parents: string[] = [],
    ): string[] | null => {
      for (const item of items) {
        if (item.key === targetKey) return parents;
        if (item.children) {
          const res = findParentKeys(item.children, targetKey, [
            ...parents,
            item.key,
          ]);
          if (res) return res;
        }
      }
      return null;
    };
    const parents = findParentKeys(menuItems.value, matchedItem.key);
    if (parents) {
      openKeys.value = [...new Set([...openKeys.value, ...parents])];
    }
  }
};

const handleMenuClick = ({ key }: { key: string }) => {
  const findItem = (items: any[]): any => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const menuItem = findItem(menuItems.value);
  if (menuItem && menuItem.path) {
    router.push(menuItem.path);
  }
};

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
  },
  { immediate: true },
);

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
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <template v-for="item in menuItems" :key="item.key">
          <a-sub-menu v-if="item.children" :key="item.key">
            <template #icon>
              <component :is="iconMap[item.icon]" />
            </template>
            <template #title>{{ item.label }}</template>
            <a-menu-item v-for="child in item.children" :key="child.key">
              <template #icon>
                <component :is="iconMap[child.icon]" />
              </template>
              <span>{{ child.label }}</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="item.key">
            <template #icon>
              <component :is="iconMap[item.icon]" />
            </template>
            <span>{{ item.label }}</span>
          </a-menu-item>
        </template>
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
          <BreadcrumbNav />
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
