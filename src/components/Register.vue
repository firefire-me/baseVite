<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { register } from "@/api/login";
import {
  UserAddOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

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
  <div class="register-container">
    <div class="register-left">
      <div class="brand-section">
        <div class="brand-logo">
          <UserAddOutlined class="logo-icon" />
        </div>
        <h1 class="brand-title">加入我们</h1>
        <p class="brand-description">创建您的账号，开始高效的任务管理之旅</p>
        <div class="brand-features">
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>免费使用</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>数据安全</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>实时同步</span>
          </div>
        </div>
      </div>
    </div>
    <div class="register-right">
      <div class="register-form-container">
        <div class="form-header">
          <h2>创建账号</h2>
          <p>填写以下信息完成注册</p>
        </div>
        <a-form
          :model="{ username, password, confirmPassword }"
          @finish="handleRegister"
          layout="vertical"
          class="register-form"
        >
          <a-form-item label="用户名" name="username">
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
          <a-form-item label="密码" name="password">
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
          <a-form-item label="确认密码" name="confirmPassword">
            <a-input-password
              v-model:value="confirmPassword"
              placeholder="请再次输入密码"
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
              class="register-button"
            >
              注册
            </a-button>
          </a-form-item>
          <div class="form-footer">
            <span>已有账号？</span>
            <a @click="router.push('/login')">立即登录</a>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.register-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;

  .register-left {
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

  .register-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: white;
    animation: slideInRight 0.6s ease-out;

    .register-form-container {
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

      .register-form {
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

        .register-button {
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
  .register-container {
    flex-direction: column;

    .register-left {
      display: none;
    }

    .register-right {
      padding: 24px;
    }
  }
}
</style>
