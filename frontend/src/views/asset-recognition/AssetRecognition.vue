<template>
  <div class="asset-recognition">
    <div class="page-header">
      <h2 class="page-title">清单识别</h2>
    </div>

    <!-- 文件上传区域 -->
    <el-card class="upload-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>上传文件</span>
        </div>
      </template>
      
      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :auto-upload="false"
        :multiple="true"
        :limit="20"
        :accept="acceptedFormats"
        :before-upload="beforeUpload"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式：.xlsx/.xls/.pdf/.jpg/.jpeg/.png/.docx<br>
            单文件大小不超过100MB，单次最多上传20个文件
          </div>
        </template>
      </el-upload>

      <div class="upload-actions" v-if="fileList.length > 0">
        <el-button type="primary" @click="handleUpload" :loading="uploading">
          开始识别
        </el-button>
        <el-button @click="handleClearFiles">清空文件</el-button>
      </div>
    </el-card>

    <!-- 历史识别记录 -->
    <el-card class="history-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>历史识别记录</span>
        </div>
      </template>

      <el-table :data="historyList" stripe>
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="fileCount" label="文件数" width="100" align="center" />
        <el-table-column prop="deviceCount" label="设备数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="关联项目" min-width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row.id)">
              查看
            </el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, UploadUserFile, UploadProps, UploadInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 接受的文件格式
const acceptedFormats = '.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.docx'

// 文件列表
const fileList = ref<UploadUserFile[]>([])
const uploadRef = ref<UploadInstance>()
const uploading = ref(false)

// 历史记录接口
interface HistoryRecord {
  id: string
  name: string
  fileCount: number
  deviceCount: number
  status: 'processing' | 'completed' | 'failed'
  projectName: string
  createTime: string
}

// Mock 历史记录数据
const historyList = ref<HistoryRecord[]>([
  {
    id: '1',
    name: '医疗设备清单_2024Q1',
    fileCount: 3,
    deviceCount: 25,
    status: 'completed',
    projectName: '人民医院医疗设备租赁项目',
    createTime: '2024-01-15 14:30:22'
  },
  {
    id: '2',
    name: '办公设备采购清单',
    fileCount: 1,
    deviceCount: 15,
    status: 'completed',
    projectName: '科技园区办公设备租赁',
    createTime: '2024-01-10 09:15:33'
  },
  {
    id: '3',
    name: '生产线设备清单',
    fileCount: 5,
    deviceCount: 48,
    status: 'processing',
    projectName: '智能制造产线租赁项目',
    createTime: '2024-01-08 16:45:10'
  }
])

// 文件上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    ElMessage.error(`文件 ${file.name} 大小超过100MB`)
    return false
  }
  return true
}

// 文件变化处理
const handleFileChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}

// 超出文件数量限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('最多只能上传20个文件')
}

// 清空文件
const handleClearFiles = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
}

// 开始上传识别
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  uploading.value = true
  
  // 模拟上传和识别过程
  setTimeout(() => {
    uploading.value = false
    ElMessage.success('文件上传成功，正在识别中...')
    
    // 跳转到识别结果页
    router.push('/asset-recognition/result/mock-id-' + Date.now())
  }, 1500)
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    processing: '识别中',
    completed: '已完成',
    failed: '识别失败'
  }
  return textMap[status] || status
}

// 查看识别结果
const handleView = (id: string) => {
  router.push(`/asset-recognition/result/${id}`)
}

// 删除记录
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条识别记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // Mock 删除操作
    const index = historyList.value.findIndex(item => item.id === id)
    if (index > -1) {
      historyList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
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

.asset-recognition {
  padding: 20px;
}

.upload-card {
  margin-bottom: 24px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #FF6600;
}

.el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin: 40px 0 16px;
}

.el-upload__text {
  font-size: 14px;
  color: #606266;
}

.el-upload__text em {
  color: #FF6600;
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
  line-height: 1.6;
  text-align: center;
}

.upload-actions {
  margin-top: 20px;
  text-align: center;
}

.upload-actions .el-button {
  margin: 0 8px;
}

.history-card {
  margin-bottom: 24px;
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

:deep(.el-button.is-link.el-button--primary) {
  background-color: transparent;
  border-color: transparent;
}
</style>
