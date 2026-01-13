<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { uploadFile } from "@/api/upload";

const username = ref("");
const avatarUrl = ref("");
const fileList = ref<any[]>([]);

onMounted(() => {
  const storedUsername = localStorage.getItem("username");
  const storedAvatar = localStorage.getItem("avatar");
  if (storedUsername) {
    username.value = storedUsername;
  }
  if (storedAvatar) {
    avatarUrl.value = storedAvatar;
    fileList.value = [
      {
        uid: "-1",
        name: "avatar.jpg",
        status: "done",
        url: storedAvatar,
      },
    ];
  }
});

const handleUpload = ({ file }: { file: File }) => {
  const formData = new FormData();
  formData.append("file", file);
  uploadFile(formData)
    .then((response) => {
      console.log(response, "response");

      handleUploadSuccess(response);
    })
    .catch((error) => {
      message.error("头像上传失败");
    });
};

// 处理头像上传成功
const handleUploadSuccess = (response: { url: string }) => {
  // 在实际项目中，这里应该处理服务器返回的头像 URL
  // 这里我们使用本地 URL 进行模拟
  const url = response.url;
  avatarUrl.value = url;
  const name = url.split("/").pop() || "avatar.jpg";
  fileList.value = [{ uid: "-1", name, status: "done", url }];
  localStorage.setItem("avatar", url);
  message.success("头像上传成功");
};

// 处理头像上传前的校验
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("请上传 JPG 或 PNG 格式的图片");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB");
    return false;
  }
  return true;
};

// 处理头像移除
const handleRemove = () => {
  avatarUrl.value = "";
  fileList.value = [];
  localStorage.removeItem("avatar");
  message.success("头像已移除");
  return false; // 阻止默认移除行为，我们手动处理
};
</script>

<template>
  <div class="profile-container">
    <a-card title="个人中心" :bordered="false" style="margin-top: 20px">
      <div class="profile-content">
        <div class="avatar-section">
          <h3>头像设置</h3>
          <div class="avatar-uploader-wrapper">
            <a-upload
              v-model:file-list="fileList"
              list-type="picture-circle"
              class="avatar-uploader"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              :custom-request="handleUpload"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="avatar"
                class="avatar"
              />
              <div v-else class="avatar-uploader-trigger">
                <a-icon type="plus" />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
          </div>
          <div class="avatar-tips">
            <p>支持 JPG、PNG 格式，大小不超过 2MB</p>
            <a-button type="text" danger @click="handleRemove" v-if="avatarUrl">
              移除头像
            </a-button>
          </div>
        </div>

        <div class="user-info-section">
          <h3>基本信息</h3>
          <a-descriptions bordered :column="2" style="margin-top: 20px">
            <a-descriptions-item label="用户名">{{
              username
            }}</a-descriptions-item>
            <a-descriptions-item label="状态">已登录</a-descriptions-item>
            <a-descriptions-item label="头像状态" :span="2">
              {{ avatarUrl ? "已设置" : "未设置" }}
            </a-descriptions-item>
            <a-descriptions-item label="最后更新时间" :span="2">
              {{ new Date().toLocaleString() }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-card>
  </div>
</template>

<style scoped lang="less">
.profile-container {
  width: 100%;
  .profile-content {
    display: flex;
    gap: 40px;
    .avatar-section {
      flex: 1;
      max-width: 300px;
      h3 {
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: bold;
      }
      .avatar-uploader-wrapper {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }
      .avatar-uploader {
        width: 128px;
        height: 128px;
        .avatar {
          width: 128px;
          height: 128px;
          border-radius: 50%;
        }
        .avatar-uploader-trigger {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed #d9d9d9;
          cursor: pointer;
          transition: all 0.3s;
          &:hover {
            border-color: #1890ff;
          }
          .ant-upload-text {
            margin-top: 8px;
            color: #666;
          }
        }
      }
      .avatar-tips {
        text-align: center;
        p {
          color: #999;
          margin-bottom: 10px;
        }
      }
    }
    .user-info-section {
      flex: 2;
      h3 {
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: bold;
      }
    }
  }
}
</style>
