<template>
  <div class="contract-review">
    <div class="page-header">
      <h2 class="page-title">合同审核</h2>
    </div>

    <!-- 上传区域卡片 -->
    <el-card class="upload-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>上传合同</span>
        </div>
      </template>

      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :auto-upload="false"
        :limit="1"
        :accept="acceptedFormats"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将合同文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式：PDF / Word (.doc, .docx)，单文件不超过50MB
          </div>
        </template>
      </el-upload>

      <div class="upload-options" v-if="fileList.length > 0">
        <el-form :model="reviewForm" label-width="100px">
          <el-form-item label="合同类型">
            <el-select v-model="reviewForm.contractType" placeholder="请选择合同类型" style="width: 100%">
              <el-option label="融资租赁合同" value="finance_lease" />
              <el-option label="售后回租合同" value="sale_leaseback" />
              <el-option label="直租合同" value="direct_lease" />
              <el-option label="担保合同" value="guarantee" />
            </el-select>
          </el-form-item>
          <el-form-item label="对比模板">
            <el-select v-model="reviewForm.templateType" placeholder="请选择对比模板" style="width: 100%">
              <el-option label="标准模板 v2.0" value="standard_v2" />
              <el-option label="售后回租模板 v1.5" value="leaseback_v1.5" />
              <el-option label="直租模板 v1.0" value="direct_v1" />
              <el-option label="不使用模板" value="none" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="upload-actions" v-if="fileList.length > 0">
        <el-button type="primary" @click="handleStartReview" :loading="processing" class="review-btn">
          <el-icon><CircleCheck /></el-icon>
          开始审核
        </el-button>
        <el-button @click="handleClearFiles">
          <el-icon><Delete /></el-icon>
          清空文件
        </el-button>
      </div>
    </el-card>

    <!-- 历史审核记录卡片 -->
    <el-card class="history-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>历史审核记录</span>
          <span class="table-count">共 {{ historyList.length }} 条</span>
        </div>
      </template>

      <el-table :data="historyList" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contractName" label="合同名称" min-width="200" />
        <el-table-column prop="contractType" label="合同类型" width="140">
          <template #default="{ row }">
            {{ getContractTypeText(row.contractType) }}
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskLevel)" size="small">
              {{ getRiskLevelText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="综合评分" width="100" align="center">
          <template #default="{ row }">
            <span class="score-text" :class="getScoreClass(row.score)">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reviewTime" label="审核时间" width="160" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row.id)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, UploadUserFile, UploadProps, UploadInstance } from 'element-plus'
import {
  UploadFilled,
  CircleCheck,
  Delete,
  View,
} from '@element-plus/icons-vue'

const router = useRouter()

// 接受的文件格式
const acceptedFormats = '.pdf,.doc,.docx'

// 文件列表
const fileList = ref<UploadUserFile[]>([])
const uploadRef = ref<UploadInstance>()
const processing = ref(false)

// 审核表单
const reviewForm = reactive({
  contractType: '',
  templateType: '',
})

// 历史记录接口
interface HistoryRecord {
  id: string
  contractName: string
  contractType: string
  riskLevel: 'high' | 'medium' | 'low'
  score: number
  reviewTime: string
}

// Mock历史数据
const historyList = ref<HistoryRecord[]>([
  {
    id: 'CR001',
    contractName: '深圳市科技创新有限公司融资租赁合同',
    contractType: 'finance_lease',
    riskLevel: 'low',
    score: 92,
    reviewTime: '2024-04-14 18:30:25',
  },
  {
    id: 'CR002',
    contractName: '华为技术有限公司售后回租合同',
    contractType: 'sale_leaseback',
    riskLevel: 'medium',
    score: 78,
    reviewTime: '2024-04-13 15:22:18',
  },
  {
    id: 'CR003',
    contractName: '腾讯科技直租合同_2024Q1',
    contractType: 'direct_lease',
    riskLevel: 'low',
    score: 88,
    reviewTime: '2024-04-12 10:45:33',
  },
  {
    id: 'CR004',
    contractName: '比亚迪汽车担保合同',
    contractType: 'guarantee',
    riskLevel: 'high',
    score: 65,
    reviewTime: '2024-04-11 14:20:50',
  },
  {
    id: 'CR005',
    contractName: '中兴通讯融资租赁合同',
    contractType: 'finance_lease',
    riskLevel: 'medium',
    score: 75,
    reviewTime: '2024-04-10 09:15:42',
  },
  {
    id: 'CR006',
    contractName: '大疆创新售后回租合同',
    contractType: 'sale_leaseback',
    riskLevel: 'low',
    score: 90,
    reviewTime: '2024-04-09 16:38:27',
  },
  {
    id: 'CR007',
    contractName: '顺丰速运直租合同',
    contractType: 'direct_lease',
    riskLevel: 'high',
    score: 62,
    reviewTime: '2024-04-08 11:52:15',
  },
  {
    id: 'CR008',
    contractName: '美的集团担保合同',
    contractType: 'guarantee',
    riskLevel: 'medium',
    score: 80,
    reviewTime: '2024-04-07 13:25:38',
  },
  {
    id: 'CR009',
    contractName: '格力电器融资租赁合同',
    contractType: 'finance_lease',
    riskLevel: 'low',
    score: 95,
    reviewTime: '2024-04-06 10:10:20',
  },
  {
    id: 'CR010',
    contractName: '小米科技售后回租合同',
    contractType: 'sale_leaseback',
    riskLevel: 'medium',
    score: 72,
    reviewTime: '2024-04-05 15:48:55',
  },
])

// 文件变化处理
const handleFileChange: UploadProps['onChange'] = (_uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}

// 超出文件数量限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('只能上传1个合同文件')
}

// 清空文件
const handleClearFiles = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
  reviewForm.contractType = ''
  reviewForm.templateType = ''
}

// 开始审核
const handleStartReview = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传合同文件')
    return
  }
  if (!reviewForm.contractType) {
    ElMessage.warning('请选择合同类型')
    return
  }
  if (!reviewForm.templateType) {
    ElMessage.warning('请选择对比模板')
    return
  }

  processing.value = true
  
  // 模拟审核处理
  setTimeout(() => {
    processing.value = false
    ElMessage.success('合同审核完成')
    // 跳转到审核结果页
    router.push('/contract-review/CR001')
  }, 2000)
}

// 查看详情
const handleViewDetail = (id: string) => {
  router.push(`/contract-review/${id}`)
}

// 获取合同类型文本
const getContractTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    finance_lease: '融资租赁合同',
    sale_leaseback: '售后回租合同',
    direct_lease: '直租合同',
    guarantee: '担保合同',
  }
  return typeMap[type] || type
}

// 获取风险等级文本
const getRiskLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  }
  return levelMap[level] || level
}

// 获取风险等级Tag类型
const getRiskTagType = (level: string) => {
  const typeMap: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  }
  return typeMap[level] || 'info'
}

// 获取评分样式
const getScoreClass = (score: number) => {
  if (score >= 85) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}
</script>

<style scoped>
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

.contract-review {
  padding: 20px;
}

.upload-card {
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

.upload-area {
  margin-bottom: 20px;
}

.upload-area :deep(.el-upload-dragger) {
  padding: 40px 20px;
}

.el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-options {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.review-btn {
  background-color: #FF6600;
  border-color: #FF6600;
}

.review-btn:hover {
  background-color: #ff7a1f;
  border-color: #ff7a1f;
}

.history-card {
  margin-bottom: 20px;
}

.table-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.score-text {
  font-weight: 600;
  font-size: 16px;
}

.score-high {
  color: #67c23a;
}

.score-medium {
  color: #e6a23c;
}

.score-low {
  color: #f56c6c;
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
