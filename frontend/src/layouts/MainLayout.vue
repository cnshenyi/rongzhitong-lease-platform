<template>
  <div class="main-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="sidebar">
        <div class="logo-container">
          <img src="/assets/logo.jpg" alt="融智通" class="logo-img" />
          <span v-if="!appStore.sidebarCollapsed" class="logo-text">融智通</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          :collapse-transition="false"
          class="sidebar-menu"
          background-color="#001529"
          text-color="#ffffff"
          active-text-color="#FF6600"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
            @click="handleMenuClick(item.path)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container class="main-container">
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-icon" @click="toggleSidebar">
              <Fold v-if="!appStore.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="authStore.userInfo?.avatar">
                  {{ authStore.userInfo?.real_name?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ authStore.userInfo?.real_name }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>
                    <div class="user-detail">
                      <div>{{ authStore.userInfo?.username }}</div>
                      <div class="user-role">{{ getRoleText(authStore.userInfo?.role) }}</div>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import {
  Monitor,
  Document,
  Bell,
  Folder,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton,
  Money,
  Files,
  Tickets,
  ChatDotRound,
  Collection,
  User,
  UserFilled,
  Setting,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const sidebarWidth = computed(() => appStore.sidebarCollapsed ? '64px' : '200px')
const activeMenu = computed(() => {
  const path = route.path
  // 子路由（如 /projects/1）高亮父级菜单
  const matched = menuItems.find(item => path === item.path || (item.path !== '/' && path.startsWith(item.path + '/')))
  return matched ? matched.path : path
})

const menuItems = [
  { path: '/dashboard', title: '工作台', icon: Monitor },
  { path: '/projects', title: '项目管理', icon: Folder },
  { path: '/lease-calculator', title: '租赁方案计算', icon: Money },
  { path: '/asset-recognition', title: '清单识别', icon: Files },
  { path: '/invoice-dedup', title: '发票查重', icon: Tickets },
  { path: '/contract-review', title: '合同审核', icon: Document },
  { path: '/due-diligence', title: '尽调报告', icon: Document },
  { path: '/ai-assistant', title: '智能问答', icon: ChatDotRound },
  { path: '/ai-assistant/knowledge', title: '知识库管理', icon: Collection },
  { path: '/smart-collection', title: '智能催收', icon: Bell },
  { path: '/users', title: '用户管理', icon: User },
  { path: '/roles', title: '角色管理', icon: UserFilled },
  { path: '/settings', title: '系统设置', icon: Setting },
]

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleMenuClick = (path: string) => {
  router.push(path)
}

const getRoleText = (role?: string) => {
  const roleMap: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '普通用户',
  }
  return role ? roleMap[role] || role : ''
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      await authStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #002140;
  gap: 10px;
}

.logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
}

.logo-text {
  color: #FF6600;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.logo-text-collapsed {
  color: #FF6600;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #FF6600;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.user-detail {
  padding: 4px 0;
}

.user-role {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>
