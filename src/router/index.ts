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

// 路由守卫
router.beforeEach((to, _from, next) => {
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

export default router;
