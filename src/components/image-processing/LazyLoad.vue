<template>
  <div class="lazy-load-container">
    <a-typography-title :level="2">图片懒加载</a-typography-title>
    <a-typography-paragraph>
      使用 Intersection Observer API 实现图片懒加载，支持占位图和滚动监听。
    </a-typography-paragraph>

    <div class="image-list">
      <div v-for="n in 20" :key="n" class="image-item">
        <img
          v-lazy="`https://picsum.photos/800/600?random=${n}`"
          src="https://placehold.co/800x600?text=Loading..."
          :alt="`Random Image ${n}`"
          class="lazy-img"
        />
        <div class="image-info">图片 {{ n }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { vDirective as vLazy } from "../../directives/lazy";
</script>

<style scoped lang="less">
.lazy-load-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .image-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;

    .image-item {
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .lazy-img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
      }

      .image-info {
        padding: 12px;
        text-align: center;
        background: #fafafa;
      }
    }
  }
}
</style>
