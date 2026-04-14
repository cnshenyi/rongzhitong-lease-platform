<template>
  <div class="user-management">
    <!-- 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="item in userStats" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="24"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="全部角色" style="width: 140px" clearable>
            <el-option label="全部角色" value="" />
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="业务经理" value="manager" />
            <el-option label="业务员" value="operator" />
            <el-option label="审批人" value="approver" />
            <el-option label="只读用户" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 120px" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="filterForm.department" placeholder="全部部门" style="width: 140px" clearable>
            <el-option label="全部部门" value="" />
            <el-option label="风控部" value="风控部" />
            <el-option label="业务部" value="业务部" />
            <el-option label="法务部" value="法务部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="技术部" value="技术部" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filterForm.keyword" placeholder="搜索用户名/姓名/手机号" style="width: 220px" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <span class="table-count">共 {{ filteredUsers.length }} 人</span>
        </div>
      </template>

      <el-table :data="filteredUsers" stripe border style="width: 100%">
        <el-table-column prop="username" label="用户名" width="110" />
        <el-table-column prop="realName" label="姓名" width="90" />
        <el-table-column prop="avatar" label="头像" width="70" align="center">
          <template #default="{ row }">
            <el-avatar :size="32" :style="{ backgroundColor: row.avatarColor }">
              {{ row.realName.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="90" align="center" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="warning" link size="small" @click="handleResetPassword(row)">
              <el-icon><Key /></el-icon>重置密码
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)" :disabled="row.role === 'super_admin'">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="550px">
      <el-form :model="userForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="业务经理" value="manager" />
            <el-option label="业务员" value="operator" />
            <el-option label="审批人" value="approver" />
            <el-option label="只读用户" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="userForm.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="风控部" value="风控部" />
            <el-option label="业务部" value="业务部" />
            <el-option label="法务部" value="法务部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="技术部" value="技术部" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Key, User, UserFilled, Ticket, Setting } from '@element-plus/icons-vue'

// ========== 统计 ==========
const userStats = [
  { title: '用户总数', value: '26', color: '#409EFF', icon: markRaw(User) },
  { title: '管理员', value: '3', color: '#FF6600', icon: markRaw(UserFilled) },
  { title: '今日活跃', value: '18', color: '#67C23A', icon: markRaw(Ticket) },
  { title: '停用账号', value: '2', color: '#F56C6C', icon: markRaw(Setting) },
]

// ========== 筛选 ==========
const filterForm = ref({ role: '', status: '', department: '', keyword: '' })
const handleSearch = () => {}
const handleReset = () => { filterForm.value = { role: '', status: '', department: '', keyword: '' } }

// ========== Mock用户数据 ==========
const userList = ref([
  { id: 1, username: 'admin', realName: '系统管理员', role: 'super_admin', department: '技术部', phone: '138****0001', email: 'admin@rongzhitong.com', status: 'active', lastLogin: '2024-01-15 09:30', avatarColor: '#FF6600' },
  { id: 2, username: 'zhangsan', realName: '张三', role: 'admin', department: '风控部', phone: '138****0002', email: 'zhangsan@rongzhitong.com', status: 'active', lastLogin: '2024-01-15 08:45', avatarColor: '#409EFF' },
  { id: 3, username: 'lisi', realName: '李四', role: 'manager', department: '业务部', phone: '138****0003', email: 'lisi@rongzhitong.com', status: 'active', lastLogin: '2024-01-14 17:20', avatarColor: '#67C23A' },
  { id: 4, username: 'wangwu', realName: '王五', role: 'operator', department: '业务部', phone: '138****0004', email: 'wangwu@rongzhitong.com', status: 'active', lastLogin: '2024-01-15 10:15', avatarColor: '#E6A23C' },
  { id: 5, username: 'zhaoliu', realName: '赵六', role: 'operator', department: '风控部', phone: '138****0005', email: 'zhaoliu@rongzhitong.com', status: 'active', lastLogin: '2024-01-14 16:00', avatarColor: '#909399' },
  { id: 6, username: 'sunqi', realName: '孙七', role: 'approver', department: '财务部', phone: '138****0006', email: 'sunqi@rongzhitong.com', status: 'active', lastLogin: '2024-01-15 11:30', avatarColor: '#F56C6C' },
  { id: 7, username: 'zhouba', realName: '周八', role: 'viewer', department: '法务部', phone: '138****0007', email: 'zhouba@rongzhitong.com', status: 'disabled', lastLogin: '2024-01-10 14:00', avatarColor: '#C0C4CC' },
  { id: 8, username: 'wujiu', realName: '吴九', role: 'operator', department: '业务部', phone: '138****0008', email: 'wujiu@rongzhitong.com', status: 'active', lastLogin: '2024-01-15 09:00', avatarColor: '#67C23A' },
  { id: 9, username: 'zhengshi', realName: '郑十', role: 'manager', department: '风控部', phone: '138****0009', email: 'zhengshi@rongzhitong.com', status: 'active', lastLogin: '2024-01-14 18:30', avatarColor: '#409EFF' },
  { id: 10, username: 'liuyan', realName: '刘燕', role: 'approver', department: '财务部', phone: '138****0010', email: 'liuyan@rongzhitong.com', status: 'disabled', lastLogin: '2024-01-08 10:00', avatarColor: '#E6A23C' },
])

// ========== 筛选逻辑 ==========
const filteredUsers = computed(() => {
  return userList.value.filter(u => {
    if (filterForm.value.role && u.role !== filterForm.value.role) return false
    if (filterForm.value.status && u.status !== filterForm.value.status) return false
    if (filterForm.value.department && u.department !== filterForm.value.department) return false
    if (filterForm.value.keyword) {
      const kw = filterForm.value.keyword.toLowerCase()
      if (!u.username.includes(kw) && !u.realName.includes(kw) && !u.phone.includes(kw)) return false
    }
    return true
  })
})

// ========== 工具函数 ==========
const getRoleTagType = (role: string) => ({ super_admin: 'danger', admin: '', manager: 'warning', operator: 'success', approver: 'primary', viewer: 'info' }[role] || 'info')
const getRoleLabel = (role: string) => ({ super_admin: '超级管理员', admin: '管理员', manager: '业务经理', operator: '业务员', approver: '审批人', viewer: '只读用户' }[role] || role)

// ========== 状态切换 ==========
const handleStatusChange = (row: any) => {
  const action = row.status === 'active' ? '启用' : '停用'
  ElMessage.success(`已${action}用户「${row.realName}」`)
}

// ========== 新增/编辑 ==========
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const userForm = ref({ username: '', realName: '', password: '', role: '', department: '', phone: '', email: '' })

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

const handleAdd = () => {
  isEdit.value = false
  userForm.value = { username: '', realName: '', password: '', role: '', department: '', phone: '', email: '' }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  userForm.value = { username: row.username, realName: row.realName, password: '', role: row.role, department: row.department, phone: row.phone, email: row.email }
  dialogVisible.value = true
}

const handleSave = () => {
  if (!userForm.value.username || !userForm.value.realName || !userForm.value.role) {
    ElMessage.warning('请填写必填项')
    return
  }
  if (isEdit.value) {
    const idx = userList.value.findIndex(u => u.username === userForm.value.username)
    if (idx >= 0) {
      Object.assign(userList.value[idx], { realName: userForm.value.realName, role: userForm.value.role, department: userForm.value.department, phone: userForm.value.phone, email: userForm.value.email })
    }
    ElMessage.success('用户信息已更新')
  } else {
    userList.value.unshift({
      id: Date.now(), ...userForm.value, status: 'active',
      lastLogin: '-', avatarColor: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#FF6600'][Math.floor(Math.random() * 5)],
    })
    ElMessage.success('用户已创建')
  }
  dialogVisible.value = false
}

// ========== 重置密码 ==========
const handleResetPassword = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户「${row.realName}」的密码吗？重置后密码为 123456`, '重置密码', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    ElMessage.success(`用户「${row.realName}」密码已重置为 123456`)
  } catch {}
}

// ========== 删除 ==========
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户「${row.realName}」吗？此操作不可恢复`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'danger' })
    userList.value = userList.value.filter(u => u.id !== row.id)
    ElMessage.success(`用户「${row.realName}」已删除`)
  } catch {}
}
</script>

<style scoped>
.user-management { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}
.stats-row { margin-bottom: 20px; }
.stat-card { border-radius: 8px; transition: transform 0.3s; }
.stat-card:hover { transform: translateY(-3px); }
.stat-content { display: flex; justify-content: space-between; align-items: center; }
.stat-info { flex: 1; }
.stat-title { font-size: 13px; color: #999; margin-bottom: 8px; }
.stat-value { font-size: 26px; font-weight: 600; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.filter-card { margin-bottom: 20px; border-radius: 8px; }
.filter-form { display: flex; flex-wrap: wrap; align-items: center; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.table-count { font-size: 13px; color: #999; }
</style>
