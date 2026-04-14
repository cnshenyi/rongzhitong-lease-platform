<template>
  <div class="role-management">
    <!-- 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
      <div class="header-right">
        <el-button type="primary" @click="handleAddRole">
          <el-icon><Plus /></el-icon>新增角色
        </el-button>
      </div>
    </div>

    <!-- 角色卡片列表 -->
    <el-row :gutter="20">
      <el-col :span="8" v-for="role in roleList" :key="role.id" class="role-col">
        <el-card shadow="hover" class="role-card" :class="{ 'role-disabled': !role.enabled }">
          <template #header>
            <div class="role-card-header">
              <div class="role-name-row">
                <el-tag :type="role.tagType" effect="dark" size="small">{{ role.label }}</el-tag>
                <el-tag v-if="role.isSystem" type="info" size="small" class="system-tag">系统内置</el-tag>
              </div>
              <el-dropdown trigger="click" @command="(cmd: string) => handleRoleCommand(cmd, role)">
                <el-icon class="role-more"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit"><el-icon><Edit /></el-icon>编辑</el-dropdown-item>
                    <el-dropdown-item command="permission"><el-icon><Lock /></el-icon>配置权限</el-dropdown-item>
                    <el-dropdown-item v-if="!role.isSystem" command="toggle">
                      <el-icon><Open v-if="!role.enabled" /><TurnOff v-else /></el-icon>
                      {{ role.enabled ? '停用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item v-if="!role.isSystem" command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      <span style="color: #F56C6C">删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <div class="role-body">
            <div class="role-desc">{{ role.description }}</div>
            <div class="role-meta">
              <div class="meta-item">
                <el-icon color="#409EFF"><User /></el-icon>
                <span>{{ role.userCount }} 人</span>
              </div>
              <div class="meta-item">
                <el-icon color="#67C23A"><Key /></el-icon>
                <span>{{ role.permissionCount }} 项权限</span>
              </div>
            </div>

            <!-- 权限预览 -->
            <div class="permission-preview">
              <div class="preview-title">主要权限：</div>
              <div class="preview-tags">
                <el-tag v-for="p in role.mainPermissions" :key="p" size="small" type="info" class="perm-tag">{{ p }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 权限配置对话框 -->
    <el-dialog v-model="permDialogVisible" :title="`配置权限 - ${currentRole?.label}`" width="700px" top="5vh">
      <div class="perm-dialog-content" v-if="currentRole">
        <el-alert title="勾选模块权限后，该角色的用户将拥有对应功能的访问和操作权限" type="info" :closable="false" show-icon style="margin-bottom: 20px" />

        <el-table :data="permissionModules" stripe border>
          <el-table-column prop="module" label="功能模块" width="150" />
          <el-table-column label="查看" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.view" />
            </template>
          </el-table-column>
          <el-table-column label="新增" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.create" :disabled="!row.view" />
            </template>
          </el-table-column>
          <el-table-column label="编辑" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.edit" :disabled="!row.view" />
            </template>
          </el-table-column>
          <el-table-column label="删除" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.remove" :disabled="!row.view" />
            </template>
          </el-table-column>
          <el-table-column label="审批" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.approve" :disabled="!row.view || !row.hasApprove" />
            </template>
          </el-table-column>
          <el-table-column label="导出" width="80" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.export" :disabled="!row.view" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">保存权限</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog v-model="roleDialogVisible" :title="isEditRole ? '编辑角色' : '新增角色'" width="500px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.label" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" required>
          <el-input v-model="roleForm.key" placeholder="请输入角色标识(英文)" :disabled="isEditRole" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-select v-model="roleForm.tagType" style="width: 100%">
            <el-option label="红色（危险）" value="danger" />
            <el-option label="橙色（默认）" value="" />
            <el-option label="黄色（警告）" value="warning" />
            <el-option label="绿色（成功）" value="success" />
            <el-option label="蓝色（主要）" value="primary" />
            <el-option label="灰色（信息）" value="info" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Lock, User, Key, MoreFilled, Open, TurnOff } from '@element-plus/icons-vue'

// ========== 角色列表 ==========
const roleList = ref([
  {
    id: 1, key: 'super_admin', label: '超级管理员', tagType: 'danger', isSystem: true, enabled: true,
    description: '拥有系统所有功能的完全访问权限，可管理用户、角色和系统配置',
    userCount: 1, permissionCount: 42,
    mainPermissions: ['全部模块', '用户管理', '角色管理', '系统配置'],
  },
  {
    id: 2, key: 'admin', label: '管理员', tagType: '', isSystem: true, enabled: true,
    description: '拥有业务模块的完全权限和部分系统管理权限',
    userCount: 2, permissionCount: 36,
    mainPermissions: ['项目管理', '合同审核', '尽调报告', '用户管理'],
  },
  {
    id: 3, key: 'manager', label: '业务经理', tagType: 'warning', isSystem: true, enabled: true,
    description: '管理业务团队，审核业务流程，查看统计报表',
    userCount: 3, permissionCount: 28,
    mainPermissions: ['项目管理', '租赁方案', '合同审核', '数据报表'],
  },
  {
    id: 4, key: 'operator', label: '业务员', tagType: 'success', isSystem: true, enabled: true,
    description: '负责日常业务操作，录入项目信息，上传文档资料',
    userCount: 8, permissionCount: 18,
    mainPermissions: ['项目录入', '清单识别', '发票查重', '智能问答'],
  },
  {
    id: 5, key: 'approver', label: '审批人', tagType: 'primary', isSystem: false, enabled: true,
    description: '负责业务审批流程，审核合同、尽调报告等关键文档',
    userCount: 4, permissionCount: 22,
    mainPermissions: ['合同审核', '尽调审批', '方案审批', '催收审批'],
  },
  {
    id: 6, key: 'viewer', label: '只读用户', tagType: 'info', isSystem: false, enabled: true,
    description: '仅具有查看权限，不能进行任何数据修改操作',
    userCount: 5, permissionCount: 10,
    mainPermissions: ['工作台查看', '项目查看', '报表查看', '知识库查看'],
  },
])

// ========== 权限模块 ==========
const permissionModules = ref([
  { module: '工作台', view: true, create: false, edit: false, remove: false, approve: false, export: true, hasApprove: false },
  { module: '项目管理', view: true, create: true, edit: true, remove: true, approve: true, export: true, hasApprove: true },
  { module: '租赁方案计算', view: true, create: true, edit: true, remove: false, approve: true, export: true, hasApprove: true },
  { module: '清单识别', view: true, create: true, edit: false, remove: false, approve: false, export: true, hasApprove: false },
  { module: '发票查重', view: true, create: true, edit: false, remove: false, approve: false, export: true, hasApprove: false },
  { module: '合同审核', view: true, create: true, edit: true, remove: false, approve: true, export: true, hasApprove: true },
  { module: '尽调报告', view: true, create: true, edit: true, remove: true, approve: true, export: true, hasApprove: true },
  { module: '智能问答', view: true, create: false, edit: false, remove: false, approve: false, export: false, hasApprove: false },
  { module: '知识库管理', view: true, create: true, edit: true, remove: true, approve: false, export: false, hasApprove: false },
  { module: '智能催收', view: true, create: true, edit: true, remove: false, approve: true, export: true, hasApprove: true },
  { module: '用户管理', view: true, create: true, edit: true, remove: true, approve: false, export: false, hasApprove: false },
  { module: '角色管理', view: true, create: true, edit: true, remove: true, approve: false, export: false, hasApprove: false },
])

// ========== 权限配置 ==========
const permDialogVisible = ref(false)
const currentRole = ref<any>(null)

const handlePermission = (role: any) => {
  currentRole.value = role
  permDialogVisible.value = true
}

const handleSavePermission = () => {
  ElMessage.success(`「${currentRole.value.label}」权限配置已保存`)
  permDialogVisible.value = false
}

// ========== 角色操作 ==========
const roleDialogVisible = ref(false)
const isEditRole = ref(false)
const roleForm = ref({ label: '', key: '', description: '', tagType: '' })

const handleAddRole = () => {
  isEditRole.value = false
  roleForm.value = { label: '', key: '', description: '', tagType: '' }
  roleDialogVisible.value = true
}

const handleEditRole = (role: any) => {
  isEditRole.value = true
  roleForm.value = { label: role.label, key: role.key, description: role.description, tagType: role.tagType }
  roleDialogVisible.value = true
}

const handleSaveRole = () => {
  if (!roleForm.value.label || !roleForm.value.key) {
    ElMessage.warning('请填写角色名称和标识')
    return
  }
  if (isEditRole.value) {
    const idx = roleList.value.findIndex(r => r.key === roleForm.value.key)
    if (idx >= 0) {
      Object.assign(roleList.value[idx], { label: roleForm.value.label, description: roleForm.value.description, tagType: roleForm.value.tagType })
    }
    ElMessage.success('角色信息已更新')
  } else {
    roleList.value.push({
      id: Date.now(), key: roleForm.value.key, label: roleForm.value.label,
      tagType: roleForm.value.tagType, isSystem: false, enabled: true,
      description: roleForm.value.description, userCount: 0, permissionCount: 0,
      mainPermissions: ['待配置权限'],
    })
    ElMessage.success('角色已创建')
  }
  roleDialogVisible.value = false
}

const handleRoleCommand = async (cmd: string, role: any) => {
  if (cmd === 'edit') { handleEditRole(role) }
  else if (cmd === 'permission') { handlePermission(role) }
  else if (cmd === 'toggle') {
    role.enabled = !role.enabled
    ElMessage.success(`角色「${role.label}」已${role.enabled ? '启用' : '停用'}`)
  } else if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm(`确定要删除角色「${role.label}」吗？关联用户将失去该角色权限`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'danger' })
      roleList.value = roleList.value.filter(r => r.id !== role.id)
      ElMessage.success(`角色「${role.label}」已删除`)
    } catch {}
  }
}
</script>

<style scoped>
.role-management { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.role-col { margin-bottom: 20px; }
.role-card { border-radius: 10px; transition: transform 0.3s, box-shadow 0.3s; }
.role-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
.role-disabled { opacity: 0.6; }

.role-card-header { display: flex; justify-content: space-between; align-items: center; }
.role-name-row { display: flex; align-items: center; gap: 8px; }
.system-tag { margin-left: 4px; }
.role-more { cursor: pointer; font-size: 18px; color: #999; transition: color 0.3s; }
.role-more:hover { color: #FF6600; }

.role-body { }
.role-desc { font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 16px; min-height: 42px; }

.role-meta { display: flex; gap: 24px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }

.permission-preview { }
.preview-title { font-size: 12px; color: #999; margin-bottom: 8px; }
.preview-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.perm-tag { border-radius: 4px; }

.perm-dialog-content { max-height: 60vh; overflow-y: auto; }
</style>
