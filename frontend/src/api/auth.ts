import request from './request'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: UserInfo
}

export interface UserInfo {
  id: string
  username: string
  real_name: string
  email?: string
  phone?: string
  role: string
  department?: string
  avatar?: string
  status: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 登录
export function login(data: LoginRequest) {
  return request.post<any, ApiResponse<LoginResponse>>('/auth/login', data)
}

// 登出
export function logout() {
  return request.post<any, ApiResponse<null>>('/auth/logout')
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get<any, ApiResponse<UserInfo>>('/auth/me')
}
