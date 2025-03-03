import { getToken } from '@/utils/token'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        redirect: '/dashboard',
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '仪表盘', icon: 'Odometer' }
            },
            {
                path: 'user',
                name: 'User',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '用户管理', icon: 'User' }
            },
            {
                path: 'category',
                name: 'Category',
                component: () => import('@/views/category/index.vue'),
                meta: { title: '分类管理', icon: 'Folder' }
            },
            {
                path: 'mod',
                name: 'Mod',
                component: () => import('@/views/mod/index.vue'),
                meta: { title: '模组审核', icon: 'Files' }
            },
            {
                path: 'mod/:id',
                name: 'ModDetail',
                component: () => import('@/views/mod/detail.vue'),
                meta: { title: '模组详情', icon: 'Files' }
            },
            {
                path: 'game',
                name: 'Game',
                component: () => import('@/views/game/index.vue'),
                meta: { title: '游戏管理', icon: 'GamePad' }
            },
            {
                path: 'comment',
                name: 'Comment',
                component: () => import('@/views/comment/index.vue'),
                meta: { title: '评论管理', icon: 'ChatDotRound' }
            },
            {
                path: 'report',
                name: 'Report',
                component: () => import('@/views/report/index.vue'),
                meta: { title: '举报管理', icon: 'Warning' }
            },
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('@/views/settings/index.vue'),
                meta: { title: '个人设置' }
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { requiresAuth: false }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const token = getToken()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !token) {
        // 需要认证但未登录，重定向到登录页
        next({ name: 'Login' })
    } else if (to.name === 'Login' && token) {
        // 已登录但访问登录页，重定向到首页
        next({ name: 'Dashboard' })
    } else {
        next()
    }
})

export default router 