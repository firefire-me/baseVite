import request from '../axios';

// 任务数据类型
interface Task {
  _id: string;
  title: string;
  isCompleted: boolean;
}

// 分页信息类型
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API 响应数据类型
interface TaskListResponse {
  success: boolean;
  data: Task[];
  pagination: Pagination;
}

// 查询参数类型
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: boolean;
  search?: string;
}

// /api/tasks 获取任务列表
export const getTasks = (params?: TaskQueryParams): Promise<TaskListResponse> => {
  return request.get("/api/tasks", { params });
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