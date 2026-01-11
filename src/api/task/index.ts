import request from '../axios';

// /api/tasks 获取任务列表
export const getTasks = () => {
  return request.get("/api/tasks");
};

// 创建新任务 (CREATE)
export const createTask = (data: { title: string; isCompleted: boolean }) => {
  return request.post("/api/tasks", data);
};

// put('/api/tasks/:id' 更新任务 (UPDATE)
export const updateTask = (id: string, data: { title?: string; isCompleted?: boolean }) => {
  return request.put(`/api/tasks/${id}`, data);
};

// delete('/api/tasks/:id' 删除任务 (DELETE)
export const deleteTask = (id: string) => {
  return request.delete(`/api/tasks/${id}`);
};