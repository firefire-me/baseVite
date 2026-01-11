import axios from 'axios';

// 创建axios实例
const service = axios.create({
  // 从环境变量获取基础URL
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 请求超时时间
  timeout: 5000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 直接返回数据部分
    return response.data;
  },
  (error) => {
    // 处理响应错误
    console.error('响应错误:', error);
    let errorMessage = '请求失败，请稍后重试';
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          // 可以在这里处理登录过期，跳转到登录页
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data.message || `请求失败，状态码：${status}`;
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMessage = '网络错误，服务器无响应';
    } else {
      // 请求配置错误
      errorMessage = error.message;
    }
    
    // 可以在这里统一处理错误提示，例如使用message组件
    return Promise.reject(new Error(errorMessage));
  }
);

export default service;