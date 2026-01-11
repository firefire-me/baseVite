import request from '../axios';

// /api/login 登录
export const login = (data: { username: string; password: string }) => {
  return request.post("/api/login", data);
};

// /api/register 注册
export const register = (data: { username: string; password: string }) => {
  return request.post("/api/register", data);
};
