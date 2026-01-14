import request from '../axios';

// 登录响应类型
interface LoginResponse {
  token: string;
  username: string;
}

// 登录 API
export const login = (data: { username: string; password: string }): Promise<LoginResponse> => {
  return request.post("/api/login", data);
};

// 注册响应类型
interface RegisterResponse {
  message: string;
}

// 注册 API
export const register = (data: { username: string; password: string }): Promise<RegisterResponse> => {
  return request.post("/api/register", data);
};

// 测试 /text
export const text = (): Promise<void> => {
  // return request.get("/text");

  return request.get("https://api.575755.xyz/text");
};

// /webhook-update?secret=my_super_secret_deploy_password  post
export const webhookUpdate = (): Promise<void> => {
  return request.post("/webhook-update?secret=my_super_secret_deploy_password");
};
