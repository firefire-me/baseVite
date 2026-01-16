<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { login } from "@/api/login";
import {
  DashboardOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons-vue";

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
    const res = await login({
      username: username.value,
      password: password.value,
    });

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
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">
          <DashboardOutlined class="logo-icon" />
        </div>
        <h1 class="brand-title">任务管理系统</h1>
        <p class="brand-description">高效管理您的任务，提升工作效率</p>
        <div class="brand-features">
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>任务管理</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>数据统计</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>团队协作</span>
          </div>
        </div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-container">
        <div class="form-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>
        <a-form
          :model="{ username, password }"
          @finish="handleLogin"
          layout="vertical"
          class="login-form"
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
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
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
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              block
              size="large"
              :loading="loading"
              class="login-button"
            >
              登录
            </a-button>
          </a-form-item>
          <div class="form-footer">
            <span>还没有账号？</span>
            <a @click="router.push('/register')">立即注册</a>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;

  .login-left {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.9) 0%,
      rgba(118, 75, 162, 0.9) 100%
    );
    animation: slideInLeft 0.6s ease-out;

    .brand-section {
      color: white;
      max-width: 480px;

      .brand-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        margin-bottom: 32px;
        backdrop-filter: blur(10px);

        .logo-icon {
          font-size: 40px;
          color: white;
        }
      }

      .brand-title {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 16px;
        animation: fadeInUp 0.6s ease-out 0.2s both;
      }

      .brand-description {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 48px;
        animation: fadeInUp 0.6s ease-out 0.4s both;
      }

      .brand-features {
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: fadeInUp 0.6s ease-out 0.6s both;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;

          .feature-icon {
            font-size: 20px;
            color: #52c41a;
          }
        }
      }
    }
  }

  .login-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: white;
    animation: slideInRight 0.6s ease-out;

    .login-form-container {
      width: 100%;
      max-width: 420px;

      .form-header {
        margin-bottom: 40px;

        h2 {
          font-size: 32px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 8px;
        }

        p {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
        }
      }

      .login-form {
        :deep(.ant-form-item-label > label) {
          font-size: 14px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.65);
        }

        :deep(.ant-input-affix-wrapper) {
          border-radius: 8px;
          padding: 12px 16px;
          transition: all 0.3s;

          &:hover,
          &:focus-within {
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
          }

          .input-icon {
            color: rgba(0, 0, 0, 0.25);
          }
        }

        .login-button {
          height: 48px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }

        .form-footer {
          text-align: center;
          margin-top: 24px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;

          a {
            color: #667eea;
            margin-left: 4px;
            font-weight: 500;
            transition: color 0.3s;

            &:hover {
              color: #764ba2;
            }
          }
        }
      }
    }
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;

    .login-left {
      display: none;
    }

    .login-right {
      padding: 24px;
    }
  }
}
</style>
