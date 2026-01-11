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
