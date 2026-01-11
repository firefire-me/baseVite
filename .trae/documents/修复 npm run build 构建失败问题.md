# 修复 npm run build 构建失败问题

## 问题分析
构建失败是由于 TypeScript 编译错误导致的，共有6个错误：

1. **Login.vue**: 无法找到模块 '@/api/login' 或其类型声明
2. **Register.vue**: 无法找到模块 '@/api/Login' 或其类型声明
3. **TaskCenter.vue**: 无法找到模块 '@/api/task/index' 或其类型声明
4. **TaskCenter.vue**: 参数 'item' 隐式具有 'any' 类型
5. **TaskCenter.vue**: 'response' 声明但未使用
6. **TaskCenter.vue**: 参数 'record' 隐式具有 'any' 类型

## 修复方案

### 1. 创建 login API 模块
- 在 `src/api/login/` 目录下创建 `index.ts` 文件
- 实现 `login` 函数和 `register` 函数

### 2. 修复导入路径错误
- 将 `Register.vue` 中的 `@/api/Login` 改为 `@/api/login`（大小写问题）

### 3. 修复 TaskCenter.vue 中的类型问题
- 为 `item` 参数添加明确的类型定义
- 删除或使用未使用的 `response` 变量
- 为 `record` 参数添加明确的类型定义

### 4. 验证修复结果
- 运行 `npm run build` 命令验证构建是否成功

## 修复步骤

1. 创建 `src/api/login/index.ts` 文件，实现登录和注册 API
2. 修改 `Register.vue` 中的导入路径
3. 修改 `TaskCenter.vue` 中的类型问题
4. 运行构建命令验证修复结果

## 预期结果
成功解决所有 TypeScript 编译错误，`npm run build` 命令执行成功。