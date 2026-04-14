<template>
  <div class="due-diligence">
    <!-- 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">尽调报告</h2>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建尽调报告
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 150px" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="资料收集中" value="collecting" />
            <el-option label="分析中" value="analyzing" />
            <el-option label="生成中" value="generating" />
            <el-option label="待审核" value="pending" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="filterForm.owner" placeholder="全部负责人" style="width: 150px" clearable>
            <el-option label="全部负责人" value="" />
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索项目名称或承租人"
            style="width: 250px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>尽调报告列表</span>
          <span class="table-count">共 {{ filteredList.length }} 条</span>
        </div>
      </template>

      <el-table :data="filteredList" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="projectName" label="项目名称" min-width="200" />
        <el-table-column prop="lessee" label="承租人" min-width="180" />
        <el-table-column prop="amount" label="项目金额(万元)" width="140" align="right">
          <template #default="{ row }">
            {{ row.amount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row.id)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button 
              link 
              type="primary" 
              @click="handleEdit(row.id)"
              v-if="row.status === 'draft' || row.status === 'pending'"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              link 
              type="primary" 
              @click="handleExport(row.id)"
              v-if="row.status === 'completed'"
            >
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  View,
  Edit,
  Download,
} from '@element-plus/icons-vue'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  status: '',
  owner: '',
  keyword: '',
})

// 报告记录接口
interface ReportRecord {
  id: string
  projectName: string
  lessee: string
  amount: number
  status: 'draft' | 'collecting' | 'analyzing' | 'generating' | 'pending' | 'completed'
  owner: string
  createTime: string
}

// Mock数据
const reportList = ref<ReportRecord[]>([
  {
    id: 'DD001',
    projectName: '深圳市科技创新有限公司医疗设备融资租赁项目',
    lessee: '深圳市科技创新有限公司',
    amount: 5000,
    status: 'completed',
    owner: '张三',
    createTime: '2024-04-14 10:30:25',
  },
  {
    id: 'DD002',
    projectName: '华为技术有限公司工程机械售后回租项目',
    lessee: '华为技术有限公司',
    amount: 12000,
    status: 'pending',
    owner: '李四',
    createTime: '2024-04-13 15:22:18',
  },
  {
    id: 'DD003',
    projectName: '腾讯科技办公设备直租项目',
    lessee: '腾讯科技（深圳）有限公司',
    amount: 3500,
    status: 'generating',
    owner: '王五',
    createTime: '2024-04-12 09:45:33',
  },
  {
    id: 'DD004',
    projectName: '比亚迪汽车运输车辆融资租赁项目',
    lessee: '比亚迪汽车工业有限公司',
    amount: 8000,
    status: 'analyzing',
    owner: '张三',
    createTime: '2024-04-11 14:20:50',
  },
  {
    id: 'DD005',
    projectName: '中兴通讯医疗设备融资租赁项目',
    lessee: '中兴通讯股份有限公司',
    amount: 6500,
    status: 'collecting',
    owner: '李四',
    createTime: '2024-04-10 11:15:42',
  },
  {
    id: 'DD006',
    projectName: '大疆创新工程机械售后回租项目',
    lessee: '深圳市大疆创新科技有限公司',
    amount: 4200,
    status: 'draft',
    owner: '王五',
    createTime: '2024-04-09 16:38:27',
  },
  {
    id: 'DD007',
    projectName: '顺丰速运运输车辆直租项目',
    lessee: '顺丰速运有限公司',
    amount: 15000,
    status: 'completed',
    owner: '张三',
    createTime: '2024-04-08 13:52:15',
  },
  {
    id: 'DD008',
    projectName: '美的集团办公设备融资租赁项目',
    lessee: '美的集团股份有限公司',
    amount: 2800,
    status: 'pending',
    owner: '李四',
    createTime: '2024-04-07 10:25:38',
  },
  {
    id: 'DD009',
    projectName: '格力电器医疗设备融资租赁项目',
    lessee: '珠海格力电器股份有限公司',
    amount: 7500,
    status: 'completed',
    owner: '王五',
    createTime: '2024-04-06 09:10:20',
  },
  {
    id: 'DD010',
    projectName: '小米科技工程机械售后回租项目',
    lessee: '小米科技有限责任公司',
    amount: 9200,
    status: 'draft',
    owner: '张三',
    createTime: '2024-04-05 14:48:55',
  },
])

// 计算过滤后的列表
const filteredList = computed(() => {
  return reportList.value.filter(item => {
    const statusMatch = !filterForm.status || item.status === filterForm.status
    const ownerMatch = !filterForm.owner || item.owner === filterForm.owner
    const keywordMatch = !filterForm.keyword || 
      item.projectName.includes(filterForm.keyword) || 
      item.lessee.includes(filterForm.keyword)
    return statusMatch && ownerMatch && keywordMatch
  })
})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    collecting: '资料收集中',
    analyzing: '分析中',
    generating: '生成中',
    pending: '待审核',
    completed: '已完成',
  }
  return statusMap[status] || status
}

// 获取状态Tag类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    collecting: 'warning',
    analyzing: 'warning',
    generating: 'warning',
    pending: 'primary',
    completed: 'success',
  }
  return typeMap[status] || 'info'
}

// 新建报告
const handleCreate = () => {
  router.push('/due-diligence/create')
}

// 查询
const handleSearch = () => {
  // 过滤逻辑已在computed中实现
  ElMessage.success('查询完成')
}

// 重置
const handleReset = () => {
  filterForm.status = ''
  filterForm.owner = ''
  filterForm.keyword = ''
}

// 查看详情
const handleViewDetail = (id: string) => {
  router.push(`/due-diligence/${id}`)
}

// 编辑
const handleEdit = (id: string) => {
  router.push(`/due-diligence/create?id=${id}&mode=edit`)
}

// 导出
const handleExport = (id: string) => {
  ElMessage.success(`正在导出报告 ${id}`)
}
</script>

<style scoped>
.due-diligence {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

:deep(.el-button--primary:not(.is-link)) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-button--primary:not(.is-link):hover) {
  background-color: #ff7a1f;
  border-color: #ff7a1f;
}

:deep(.el-button--primary:not(.is-link):active) {
  background-color: #e65c00;
  border-color: #e65c00;
}
</style>
