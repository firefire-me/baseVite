<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HomeOutlined } from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();

const breadcrumbItems = computed(() => {
  const pathArray = route.path.split("/").filter((item) => item);
  const items = [
    {
      title: "首页",
      path: "/home",
    },
  ];

  const routeMap: Record<string, string> = {
    "task-center": "任务中心",
    profile: "个人中心",
  };

  pathArray.forEach((path, index) => {
    if (routeMap[path]) {
      items.push({
        title: routeMap[path],
        path:
          index === pathArray.length - 1
            ? ""
            : `/${pathArray.slice(0, index + 1).join("/")}`,
      });
    }
  });

  return items;
});

const handleNavigate = (path: string) => {
  if (path) {
    router.push(path);
  }
};
</script>

<template>
  <a-breadcrumb class="breadcrumb-nav">
    <a-breadcrumb-item
      v-for="(item, index) in breadcrumbItems"
      :key="index"
      :class="{ 'is-last': index === breadcrumbItems.length - 1 }"
      @click="handleNavigate(item.path)"
    >
      <HomeOutlined v-if="index === 0" />
      {{ item.title }}
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<style scoped lang="less">
.breadcrumb-nav {
  margin-bottom: 16px;
  font-size: 14px;

  :deep(.ant-breadcrumb-item) {
    cursor: pointer;
    transition: color 0.3s;

    &:hover:not(.is-last) {
      color: #1890ff;
    }

    &.is-last {
      cursor: default;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
    }
  }
}
</style>
