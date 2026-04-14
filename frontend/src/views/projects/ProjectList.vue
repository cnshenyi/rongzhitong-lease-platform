<template>
  <div class="project-list">
    <!-- 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">项目管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建项目
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="项目名称">
          <el-input v-model="filterForm.name" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="filterForm.customer" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="projectNo" label="项目编号" width="150" sortable />
        <el-table-column prop="name" label="项目名称" min-width="200" sortable />
        <el-table-column prop="customer" label="客户名称" min-width="180" sortable />
        <el-table-column prop="amount" label="项目金额（元）" width="150" align="right" sortable>
          <template #default="{ row }">
            {{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="leaseType" label="租赁物类型" width="120" sortable />
        <el-table-column prop="status" label="状态" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customer">
          <el-input v-model="formData.customer" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="项目金额" prop="amount">
          <el-input v-model.number="formData.amount" placeholder="请输入项目金额（元）">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="租赁物类型" prop="leaseType">
          <el-select v-model="formData.leaseType" placeholder="请选择租赁物类型">
            <el-option label="医疗设备" value="medical" />
            <el-option label="工程机械" value="construction" />
            <el-option label="办公设备" value="office" />
            <el-option label="运输车辆" value="vehicle" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  name: '',
  customer: '',
  status: '',
  dateRange: null as any,
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新建项目')
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: null as number | null,
  name: '',
  customer: '',
  amount: null as number | null,
  leaseType: '',
  description: '',
  status: 'draft',
})

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  amount: [
    { required: true, message: '请输入项目金额', trigger: 'blur' },
    { type: 'number', message: '请输入有效的金额', trigger: 'blur' },
  ],
  leaseType: [{ required: true, message: '请选择租赁物类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// Mock数据
const mockData = [
  {
    id: 1,
    projectNo: 'PRJ202604001',
    name: '某三甲医院CT设备融资租赁',
    customer: '北京协和医院',
    amount: 8500000,
    leaseType: '医疗设备',
    status: 'in_progress',
    description: 'CT设备采购融资租赁项目',
    createTime: '2026-04-10 10:30:00',
  },
  {
    id: 2,
    projectNo: 'PRJ202604002',
    name: '工程机械设备租赁项目',
    customer: '中建三局',
    amount: 12000000,
    leaseType: '工程机械',
    status: 'in_progress',
    description: '挖掘机、推土机等工程机械设备',
    createTime: '2026-04-11 14:20:00',
  },
  {
    id: 3,
    projectNo: 'PRJ202604003',
    name: '办公设备融资租赁',
    customer: '某科技公司',
    amount: 500000,
    leaseType: '办公设备',
    status: 'completed',
    description: '电脑、打印机等办公设备',
    createTime: '2026-04-08 09:15:00',
  },
  {
    id: 4,
    projectNo: 'PRJ202604004',
    name: '物流车辆融资租赁',
    customer: '顺丰速运',
    amount: 6000000,
    leaseType: '运输车辆',
    status: 'draft',
    description: '新能源物流车辆采购',
    createTime: '2026-04-12 16:45:00',
  },
  {
    id: 5,
    projectNo: 'PRJ202604005',
    name: '智能制造设备融资租赁',
    customer: '富士康科技集团',
    amount: 15000000,
    leaseType: '工程机械',
    status: 'closed',
    description: '自动化生产线设备采购',
    createTime: '2026-04-05 11:00:00',
  },
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 替换为真实API调用
    // const response = await getProjects(pagination.page, pagination.pageSize, filterForm)
    
    // Mock数据模拟
    await new Promise((resolve) => setTimeout(resolve, 500))
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  filterForm.name = ''
  filterForm.customer = ''
  filterForm.status = ''
  filterForm.dateRange = null
  handleSearch()
}

// 分页
const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

// 新建
const handleCreate = () => {
  dialogTitle.value = '新建项目'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑项目'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row: any) => {
  router.push(`/projects/${row.id}`)
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除项目"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // TODO: 调用创建/更新API
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      ElMessage.success(formData.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.customer = ''
  formData.amount = null
  formData.leaseType = ''
  formData.description = ''
  formData.status = 'draft'
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN')
}

// 状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    in_progress: 'warning',
    completed: 'success',
    closed: 'danger',
  }
  return typeMap[status] || 'info'
}

// 状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    in_progress: '进行中',
    completed: '已完成',
    closed: '已关闭',
  }
  return textMap[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.project-list {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
