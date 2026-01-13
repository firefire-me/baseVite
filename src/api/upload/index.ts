import request from '@/api/axios';


// 上传文件
export const uploadFile = (data: FormData) => {
  return request.post("/api/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};