<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { register } from "@/api/Login";

const router = useRouter();
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const rules = {
  username: [{ required: true, message: "请输入用户名" }],
  password: [{ required: true, message: "请输入密码" }],
  confirmPassword: [{ required: true, message: "请确认密码" }],
};

const handleRegister = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    message.error("请填写完整的注册信息");
    return;
  }

  if (password.value !== confirmPassword.value) {
    message.error("两次输入的密码不一致");
    return;
  }

  loading.value = true;

  try {
    // 模拟注册请求
    await register({ username: username.value, password: password.value });

    message.success("注册成功，请登录");
    router.push("/login");
  } catch (error) {
    message.error("注册失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">注册</h2>
      <a-form
        :model="{ username, password, confirmPassword }"
        @finish="handleRegister"
        layout="vertical"
        :rules="rules"
      >
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="username"
            placeholder="请输入用户名"
            size="large"
          />
        </a-form-item>
        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="password"
            placeholder="请输入密码"
            size="large"
          />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password
            v-model:value="confirmPassword"
            placeholder="请确认密码"
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
            注册
          </a-button>
        </a-form-item>
        <div class="login-footer">
          <span>已有账号？</span>
          <a href="#" @click.prevent="router.push('/login')">立即登录</a>
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
