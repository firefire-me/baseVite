import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/Register.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    meta: { requiresAuth: true },
    children: [
      {
          path: '',
          name: 'HomeIndex',
          component: () => import('../components/HomeIndex.vue')
        },
      {
        path: 'task-center',
        name: 'TaskCenter',
        component: () => import('../components/TaskCenter.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router