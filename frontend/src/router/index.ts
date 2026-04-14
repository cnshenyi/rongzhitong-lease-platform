import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '工作台', icon: 'Monitor' },
      },
      {
        path: 'lease-calculator',
        name: 'LeaseCalculator',
        component: () => import('@/views/lease-calculator/LeaseCalculator.vue'),
        meta: { title: '租赁方案计算', icon: 'Money' },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/projects/ProjectList.vue'),
        meta: { title: '项目管理', icon: 'Folder' },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/projects/ProjectDetail.vue'),
        meta: { title: '项目详情', icon: 'Document' },
      },
      {
        path: 'asset-recognition',
        name: 'AssetRecognition',
        component: () => import('@/views/asset-recognition/AssetRecognition.vue'),
        meta: { title: '清单识别', icon: 'Document' },
      },
      {
        path: 'asset-recognition/result/:id',
        name: 'RecognitionResult',
        component: () => import('@/views/asset-recognition/RecognitionResult.vue'),
        meta: { title: '识别结果', icon: 'Document' },
      },
      {
        path: 'invoice-dedup',
        name: 'InvoiceDedup',
        component: () => import('@/views/invoice-dedup/InvoiceDedup.vue'),
        meta: { title: '发票查重', icon: 'Tickets' },
      },
      {
        path: 'invoice-dedup/:id',
        name: 'InvoiceDetail',
        component: () => import('@/views/invoice-dedup/InvoiceDetail.vue'),
        meta: { title: '发票详情', icon: 'Document' },
      },
      {
        path: 'contract-review',
        name: 'ContractReview',
        component: () => import('@/views/contract-review/ContractReview.vue'),
        meta: { title: '合同审核', icon: 'Document' },
      },
      {
        path: 'contract-review/:id',
        name: 'ContractReviewResult',
        component: () => import('@/views/contract-review/ContractReviewResult.vue'),
        meta: { title: '审核结果', icon: 'Document' },
      },
      {
        path: 'due-diligence',
        name: 'DueDiligence',
        component: () => import('@/views/due-diligence/DueDiligence.vue'),
        meta: { title: '尽调报告', icon: 'Document' },
      },
      {
        path: 'due-diligence/create',
        name: 'DueDiligenceCreate',
        component: () => import('@/views/due-diligence/DueDiligenceCreate.vue'),
        meta: { title: '新建尽调报告', icon: 'Document' },
      },
      {
        path: 'due-diligence/:id',
        name: 'DueDiligenceReport',
        component: () => import('@/views/due-diligence/DueDiligenceReport.vue'),
        meta: { title: '报告详情', icon: 'Document' },
      },
      {
        path: 'ai-assistant',
        name: 'AIAssistant',
        component: () => import('@/views/ai-assistant/AIAssistant.vue'),
        meta: { title: '智能问答', icon: 'ChatDotRound' },
      },
      {
        path: 'ai-assistant/knowledge',
        name: 'KnowledgeBase',
        component: () => import('@/views/ai-assistant/KnowledgeBase.vue'),
        meta: { title: '知识库管理', icon: 'Collection' },
      },
      {
        path: 'smart-collection',
        name: 'SmartCollection',
        component: () => import('@/views/smart-collection/SmartCollection.vue'),
        meta: { title: '智能催收', icon: 'Bell' },
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' },
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: () => import('@/views/system/SystemSettings.vue'),
        meta: { title: '系统设置', icon: 'Setting' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth === false) {
    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && authStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    if (authStore.isLoggedIn) {
      // 如果没有用户信息，先获取
      if (!authStore.userInfo) {
        const success = await authStore.fetchUserInfo()
        if (success) {
          next()
        } else {
          next('/login')
        }
      } else {
        next()
      }
    } else {
      next('/login')
    }
  }
})

export default router
