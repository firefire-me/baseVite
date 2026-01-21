<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HomeOutlined } from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();

const breadcrumbItems = computed(() => {
  const items: { title: string; path: string }[] = [];
  const matched = route.matched;

  matched.forEach((record, index) => {
    if (record.meta && record.meta.title) {
      items.push({
        title: record.meta.title as string,
        path: index === matched.length - 1 ? "" : record.path,
      });
    } else if (record.path === "/home" || record.path === "/") {
      // 默认首页
      if (items.length === 0 || items[0]?.title !== "首页") {
        items.unshift({
          title: "首页",
          path: "/home",
        });
      }
    }
  });

  // 如果当前是 /home，只需要保留一个“首页”
  if (route.path === "/home") {
    return [{ title: "首页", path: "" }];
  }

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
