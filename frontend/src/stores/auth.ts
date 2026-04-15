import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, getCurrentUser, type UserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref<boolean>(!!token.value)

  // 登录（后端不可用时自动降级为 mock 模式）
  async function login(username: string, password: string) {
    try {
      const response = await loginApi({ username, password })
      
      token.value = response.data.token
      userInfo.value = response.data.user
      isLoggedIn.value = true
      
      localStorage.setItem('token', token.value)
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      // Mock fallback: 后端未部署时允许演示登录
      if (username === 'admin' && password === 'admin123') {
        token.value = 'mock-token-' + Date.now()
        userInfo.value = { id: 1, username: 'admin', realName: '系统管理员', role: 'admin', status: 1, avatar: '/assets/user-avatar.svg' } as UserInfo
        isLoggedIn.value = true
        localStorage.setItem('token', token.value)
        ElMessage.success('登录成功（演示模式）')
        return true
      }
      console.error('登录失败:', error)
      ElMessage.error('用户名或密码错误')
      return false
    }
  }

  // 登出
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      isLoggedIn.value = false
      localStorage.removeItem('token')
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const response = await getCurrentUser()
      userInfo.value = response.data
      return true
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，清除登录状态
      logout()
      return false
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo,
  }
})
