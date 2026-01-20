<template>
  <div class="compress-container">
    <a-typography-title :level="2">图片压缩</a-typography-title>
    <a-typography-paragraph>
      支持常见图片格式的前端压缩，可调节压缩质量并支持批量下载。
    </a-typography-paragraph>

    <div class="controls">
      <a-upload-dragger
        name="file"
        :multiple="true"
        :before-upload="beforeUpload"
        @change="handleChange"
        accept="image/*"
      >
        <p class="ant-upload-drag-icon">
          <inbox-outlined />
        </p>
        <p class="ant-upload-text">点击或拖拽图片到此区域进行压缩</p>
      </a-upload-dragger>

      <div class="quality-slider">
        <span>压缩质量: {{ quality }}%</span>
        <a-slider v-model:value="quality" :min="1" :max="100" />
      </div>

      <div class="actions">
        <a-button
          type="primary"
          :disabled="!fileList.length"
          :loading="compressing"
          @click="handleCompress"
        >
          开始压缩
        </a-button>
        <a-button :disabled="!compressedList.length" @click="handleDownloadAll">
          批量下载
        </a-button>
      </div>
    </div>

    <div v-if="compressedList.length" class="result-list">
      <a-list item-layout="horizontal" :data-source="compressedList">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a @click="downloadFile(item)">下载</a>
            </template>
            <a-list-item-meta
              :description="`原始大小: ${formatSize(item.oldSize)} -> 压缩后: ${formatSize(item.newSize)} (${item.ratio}%)`"
            >
              <template #title>
                {{ item.name }}
              </template>
              <template #avatar>
                <a-avatar :src="item.preview" shape="square" :size="64" />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { InboxOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const quality = ref(80);
const fileList = ref<any[]>([]);
const compressedList = ref<any[]>([]);
const compressing = ref(false);

const beforeUpload = (file: File) => {
  fileList.value.push(file);
  return false; // 阻止自动上传
};

const handleChange = (info: any) => {
  const { status } = info.file;
  if (status !== "uploading") {
    console.log(info.file, info.fileList);
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const handleCompress = async () => {
  compressing.value = true;
  try {
    compressedList.value = [];
    for (const file of fileList.value) {
      const compressed = await compressImage(file, quality.value / 100);
      compressedList.value.push(compressed);
    }
    message.success("压缩完成");
  } catch (error) {
    message.error("压缩失败");
    console.error(error);
  } finally {
    compressing.value = false;
  }
};

const compressImage = (file: File, q: number): Promise<any> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                name: file.name,
                oldSize: file.size,
                newSize: blob.size,
                ratio: ((blob.size / file.size) * 100).toFixed(2),
                preview: URL.createObjectURL(blob),
                blob: blob,
              });
            }
          },
          "image/jpeg",
          q,
        );
      };
    };
  });
};

const downloadFile = (item: any) => {
  const link = document.createElement("a");
  link.href = item.preview;
  link.download = `compressed_${item.name}`;
  link.click();
};

const handleDownloadAll = () => {
  compressedList.value.forEach((item) => downloadFile(item));
};
</script>

<style scoped lang="less">
.compress-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .controls {
    max-width: 600px;
    margin: 20px 0;

    .quality-slider {
      margin: 20px 0;
    }

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .result-list {
    margin-top: 30px;
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
  }
}
</style>
