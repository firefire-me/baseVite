<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { login } from "@/api/login";

const router = useRouter();
const username = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    message.error("请输入用户名和密码");
    return;
  }

  loading.value = true;

  try {
    // 调用登录接口
    const res = await login({
      username: username.value,
      password: password.value,
    });

    // 保存token到localStorage
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", username.value);

    message.success("登录成功");
    router.push("/home");
  } catch (error) {
    console.error("登录失败:", error);
    message.error("登录失败，请检查用户名和密码");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">登录</h2>
      <a-form
        :model="{ username, password }"
        @finish="handleLogin"
        layout="vertical"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="username"
            placeholder="请输入用户名"
            size="large"
          />
        </a-form-item>
        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="password"
            placeholder="请输入密码"
            size="large"
          />
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            block
            size="large"
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
        <div class="login-footer">
          <span>没有账号？</span>
          <a href="#" @click.prevent="router.push('/register')">立即注册</a>
        </div>
      </a-form>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1890ff;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-footer a {
  color: #1890ff;
  margin-left: 0.5rem;
  cursor: pointer;
}
</style>
