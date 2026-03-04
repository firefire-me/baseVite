<template>
  <a-card
    title="AI 智能问答 (打字机版)"
    style="max-width: 600px; margin: 20px auto"
  >
    <div
      ref="scrollContainer"
      class="chat-scroll-container"
      style="
        height: 400px;
        overflow-y: auto;
        margin-bottom: 20px;
        padding-right: 10px;
      "
    >
      <a-list
        class="chat-list"
        item-layout="horizontal"
        :data-source="chatHistory"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #description>
                <div style="white-space: pre-wrap; color: #333">
                  {{ item.content }}
                </div>
              </template>
              <template #title>
                <span
                  :style="{
                    color: item.role === 'user' ? '#1890ff' : '#52c41a',
                  }"
                >
                  {{ item.role === "user" ? "你" : "AI 助手" }}
                </span>
              </template>
              <template #avatar>
                <a-avatar
                  :style="{
                    backgroundColor:
                      item.role === 'user' ? '#1890ff' : '#52c41a',
                  }"
                >
                  {{ item.role === "user" ? "U" : "AI" }}
                </a-avatar>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div style="display: flex; gap: 10px">
      <a-input
        v-model:value="userInput"
        placeholder="问我任何问题..."
        @pressEnter="sendMessage"
        :disabled="loading"
      />
      <a-button type="primary" :loading="loading" @click="sendMessage">
        发送
      </a-button>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue"; // 【修改点】：引入 nextTick
import { aiApi } from "../api/ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const userInput = ref("");
const chatHistory = ref<ChatMessage[]>([]);
const loading = ref(false);

// 【修改点】：获取滚动容器的 DOM
const scrollContainer = ref<HTMLElement | null>(null);

// 【修改点】：封装一个自动滚动到底部的方法
const scrollToBottom = async () => {
  await nextTick(); // 等待 Vue 渲染更新 DOM
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || loading.value) return;

  // 1. 把用户的问题推入列表
  chatHistory.value.push({ role: "user", content: text });
  // 【修复 1】：立刻清空输入框
  userInput.value = "";
  loading.value = true;

  // 【修复 2】：用户发出消息后，滚到底部
  scrollToBottom();

  // 2. 先给 AI 占个位，内容为空
  const assistantMsgIndex =
    chatHistory.value.push({ role: "assistant", content: "" }) - 1;

  try {
    // 3. 使用封装的 API 发起流式请求
    const response = await aiApi.askQuestion(text);

    if (!response.body) throw new Error("流获取失败");

    // 4. 解析数据流（打字机核心逻辑）
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // 读取完毕，退出循环

      // 将二进制分片解码为文字
      const chunkText = decoder.decode(value, { stream: true });
      // 拼接到刚才占位的 AI 消息里，Vue 会自动触发响应式更新！
      if (chatHistory.value[assistantMsgIndex]) {
        chatHistory.value[assistantMsgIndex].content += chunkText;
      }

      // 【修复 3】：AI 每输出一小段文字，都强制跟随滚动
      scrollToBottom();
    }
  } catch (error) {
    console.error("对话出错:", error);
    if (chatHistory.value[assistantMsgIndex]) {
      chatHistory.value[assistantMsgIndex].content +=
        "\n[抱歉，网络似乎出了点问题]";
    }
    scrollToBottom(); // 报错提示时也滚一下
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 【修改点】：修改类名，针对我们新建的 div 容器进行美化 */
.chat-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.chat-scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
</style>
