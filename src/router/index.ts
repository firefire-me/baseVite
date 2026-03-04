import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";



const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../components/Register.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../components/Home.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "HomeIndex",
        component: () => import("../components/HomeIndex.vue"),
        meta: { title: "首页", icon: "DashboardOutlined", key: "home" },
      },
      {
        path: "task-center",
        name: "TaskCenter",
        component: () => import("../components/TaskCenter.vue"),
        meta: {
          title: "任务中心",
          icon: "UnorderedListOutlined",
          key: "task-center",
        },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("../components/Profile.vue"),
        meta: { title: "个人中心", icon: "UserOutlined", key: "profile" },
      },
      {
        path: "image-processing",
        name: "ImageProcessing",
        redirect: "/home/image-processing/lazy-load",
        meta: {
          title: "图片处理",
          icon: "PictureOutlined",
          key: "image-processing",
        },
        children: [
          {
            path: "lazy-load",
            name: "LazyLoad",
            component: () =>
              import("../components/image-processing/LazyLoad.vue"),
            meta: {
              title: "图片懒加载",
              icon: "FileImageOutlined",
              key: "lazy-load",
            },
          },
          {
            path: "compress",
            name: "Compress",
            component: () =>
              import("../components/image-processing/Compress.vue"),
            meta: {
              title: "图片压缩",
              icon: "CompressOutlined",
              key: "compress",
            },
          },
          {
            path: "annotate",
            name: "Annotate",
            component: () =>
              import("../components/image-processing/Annotate.vue"),
            meta: { title: "图片标注", icon: "EditOutlined", key: "annotate" },
          },
        ],
      },
      {
        path: "monitor",
        name: "Monitor",
        component: () => import("../components/MonitorPanel.vue"),
        meta: { title: "性能监测", icon: "DashboardOutlined", key: "monitor" },
      },
      {
        path: "ai-qna",
        name: "AIQnA",
        component: () => import("../components/AIQnA.vue"),
        meta: { title: "AI 问答", icon: "MessageOutlined", key: "ai-qna" },
      },

      // 404 路由 重定向到首页的路由
      {
        path: "/:pathMatch(.*)*",

        redirect: "/home",
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 导入监测模块
import { reportRouteData } from '../monitor/monitor-report';

// 路由性能监测
let routeStartTime = 0;

// 路由守卫
router.beforeEach((to, from, next) => {
  // 记录路由开始时间
  routeStartTime = Date.now();
  
  const isAuthenticated = localStorage.getItem("token");
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (isAuthenticated) {
      next();
    } else {
      next("/login");
    }
  } else {
    next();
  }
});

// 路由切换完成后上报性能数据
router.afterEach((to, from) => {
  // 计算路由切换持续时间
  const duration = Date.now() - routeStartTime;
  
  // 上报路由性能数据
  reportRouteData(
    from.path || 'unknown',
    to.path || 'unknown',
    duration
  );
});

export default router;
