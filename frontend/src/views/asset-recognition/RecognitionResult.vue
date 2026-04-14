<template>
  <div class="recognition-result">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <el-button @click="handleBack" :icon="ArrowLeft">返回</el-button>
        <span class="list-name">{{ listInfo.name }}</span>
        <el-tag :type="getStatusType(listInfo.status)">
          {{ getStatusText(listInfo.status) }}
        </el-tag>
      </div>
      <div class="top-bar-right">
        <el-button @click="handleReRecognize" :icon="Refresh">重新识别</el-button>
        <el-button type="primary" @click="handleExport" :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 汇总信息卡片 - 全宽显示 -->
    <el-card class="summary-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">总条数</div>
            <div class="summary-value">{{ summary.totalCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">总金额</div>
            <div class="summary-value primary">¥{{ formatMoney(summary.totalAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">异常数</div>
            <div class="summary-value danger">{{ summary.errorCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">待确认数</div>
            <div class="summary-value warning">{{ summary.pendingCount }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 左右分栏布局 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧：原文件预览区 -->
      <el-col :span="8">
        <el-card class="preview-card" shadow="never">
          <template #header>
            <div class="card-header">原文件预览</div>
          </template>
          <div class="preview-content">
            <el-empty description="原文件预览功能开发中" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：识别结果表格 -->
      <el-col :span="16">
        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="card-header">识别结果</div>
          </template>
          
          <el-table :data="deviceList" stripe border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="状态" width="60" align="center">
              <template #default="{ row }">
                <span :class="'status-icon status-' + row.status">{{ getStatusIcon(row.status) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="deviceName" label="设备名称" min-width="150" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="model" label="型号规格" width="150" />
            <el-table-column prop="unit" label="单位" width="80" align="center" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="单价" width="120" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.unitPrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="金额" width="140" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.totalPrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="manufacturer" label="生产厂家" min-width="150" show-overflow-tooltip />
            <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 底部按钮 -->
          <div class="table-footer">
            <el-button @click="handleApproveAll">全部通过</el-button>
            <el-button type="primary" @click="handleSave">确认保存</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑设备弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑设备信息"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="editForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="editForm.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="型号规格" prop="model">
          <el-input v-model="editForm.model" placeholder="请输入型号规格" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="editForm.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="editForm.quantity"
            :min="1"
            :precision="0"
            @change="calculateTotalPrice"
          />
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input-number
            v-model="editForm.unitPrice"
            :min="0"
            :precision="2"
            @change="calculateTotalPrice"
          />
        </el-form-item>
        <el-form-item label="金额" prop="totalPrice">
          <el-input-number
            v-model="editForm.totalPrice"
            :min="0"
            :precision="2"
            disabled
          />
        </el-form-item>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="editForm.manufacturer" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Refresh, Download } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 设备状态类型
type DeviceStatus = 'normal' | 'pending' | 'error'

// 设备接口
interface Device {
  id: string
  status: DeviceStatus
  deviceName: string
  brand: string
  model: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  manufacturer: string
  remark: string
}

// 清单信息
const listInfo = ref({
  name: '医疗设备清单_2024Q1',
  status: 'completed' as 'processing' | 'completed' | 'failed'
})

// Mock 设备数据
const deviceList = ref<Device[]>([
  {
    id: '1',
    status: 'normal',
    deviceName: '64排螺旋CT机',
    brand: 'GE医疗',
    model: 'Optima CT660',
    unit: '台',
    quantity: 1,
    unitPrice: 2800000,
    totalPrice: 2800000,
    manufacturer: '通用电气医疗系统贸易发展（上海）有限公司',
    remark: '含工作站及后处理软件'
  },
  {
    id: '2',
    status: 'normal',
    deviceName: '1.5T超导磁共振成像系统',
    brand: '西门子',
    model: 'MAGNETOM Aera',
    unit: '台',
    quantity: 1,
    unitPrice: 4500000,
    totalPrice: 4500000,
    manufacturer: '西门子医疗系统有限公司',
    remark: '包含全身线圈套装'
  },
  {
    id: '3',
    status: 'pending',
    deviceName: '彩色多普勒超声诊断仪',
    brand: '飞利浦',
    model: 'EPIQ 7C',
    unit: '台',
    quantity: 2,
    unitPrice: 850000,
    totalPrice: 1700000,
    manufacturer: '飞利浦（中国）投资有限公司',
    remark: '配心脏、腹部、血管探头'
  },
  {
    id: '4',
    status: 'normal',
    deviceName: '数字化医用X射线摄影系统',
    brand: '锐珂医疗',
    model: 'DRX-Evolution Plus',
    unit: '台',
    quantity: 1,
    unitPrice: 680000,
    totalPrice: 680000,
    manufacturer: '锐珂医疗器材（上海）有限公司',
    remark: '含平板探测器'
  },
  {
    id: '5',
    status: 'error',
    deviceName: '全自动生化分析仪',
    brand: '罗氏',
    model: 'cobas 8000',
    unit: '台',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    manufacturer: '罗氏诊断产品（上海）有限公司',
    remark: '单价信息缺失'
  },
  {
    id: '6',
    status: 'normal',
    deviceName: '电动手术床',
    brand: '迈柯唯',
    model: 'Maquet 1150',
    unit: '台',
    quantity: 3,
    unitPrice: 180000,
    totalPrice: 540000,
    manufacturer: '迈柯唯医疗设备（上海）有限公司',
    remark: '含配套附件'
  },
  {
    id: '7',
    status: 'pending',
    deviceName: '麻醉工作站',
    brand: '德尔格',
    model: 'Fabius GS Premium',
    unit: '台',
    quantity: 2,
    unitPrice: 320000,
    totalPrice: 640000,
    manufacturer: '德尔格医疗设备（上海）有限公司',
    remark: '型号待确认'
  },
  {
    id: '8',
    status: 'normal',
    deviceName: '呼吸机',
    brand: '迈瑞',
    model: 'SV300',
    unit: '台',
    quantity: 5,
    unitPrice: 85000,
    totalPrice: 425000,
    manufacturer: '深圳迈瑞生物医疗电子股份有限公司',
    remark: '含湿化器'
  },
  {
    id: '9',
    status: 'normal',
    deviceName: '监护仪',
    brand: '迈瑞',
    model: 'BeneView T8',
    unit: '台',
    quantity: 10,
    unitPrice: 45000,
    totalPrice: 450000,
    manufacturer: '深圳迈瑞生物医疗电子股份有限公司',
    remark: '含血氧、心电等模块'
  },
  {
    id: '10',
    status: 'error',
    deviceName: '除颤仪',
    brand: '未识别',
    model: '未识别',
    unit: '台',
    quantity: 3,
    unitPrice: 68000,
    totalPrice: 204000,
    manufacturer: '信息不完整',
    remark: '品牌和型号识别失败'
  }
])

// 汇总信息
const summary = computed(() => {
  const totalCount = deviceList.value.length
  const totalAmount = deviceList.value.reduce((sum, item) => sum + item.totalPrice, 0)
  const errorCount = deviceList.value.filter(item => item.status === 'error').length
  const pendingCount = deviceList.value.filter(item => item.status === 'pending').length
  
  return {
    totalCount,
    totalAmount,
    errorCount,
    pendingCount
  }
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive<Device>({
  id: '',
  status: 'normal',
  deviceName: '',
  brand: '',
  model: '',
  unit: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
  manufacturer: '',
  remark: ''
})

const editFormRules: FormRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号规格', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

// 计算总价
const calculateTotalPrice = () => {
  editForm.totalPrice = editForm.quantity * editForm.unitPrice
}

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取状态图标
const getStatusIcon = (status: DeviceStatus) => {
  const iconMap = {
    normal: '🟢',
    pending: '🟡',
    error: '🔴'
  }
  return iconMap[status]
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

// 返回
const handleBack = () => {
  router.back()
}

// 重新识别
const handleReRecognize = () => {
  ElMessageBox.confirm('重新识别将覆盖当前结果，是否继续？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.info('重新识别功能开发中')
  }).catch(() => {
    // 用户取消
  })
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 编辑设备
const handleEdit = (row: Device) => {
  Object.assign(editForm, row)
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate((valid) => {
    if (valid) {
      const index = deviceList.value.findIndex(item => item.id === editForm.id)
      if (index > -1) {
        deviceList.value[index] = { ...editForm }
        ElMessage.success('保存成功')
        editDialogVisible.value = false
      }
    }
  })
}

// 全部通过
const handleApproveAll = () => {
  deviceList.value.forEach(item => {
    if (item.status !== 'error') {
      item.status = 'normal'
    }
  })
  ElMessage.success('已将所有待确认项标记为正常')
}

// 确认保存
const handleSave = () => {
  const hasError = deviceList.value.some(item => item.status === 'error')
  const hasPending = deviceList.value.some(item => item.status === 'pending')
  
  if (hasError) {
    ElMessage.warning('存在异常数据，请先处理后再保存')
    return
  }
  
  if (hasPending) {
    ElMessageBox.confirm('存在待确认数据，是否继续保存？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('保存成功')
    }).catch(() => {
      // 用户取消
    })
  } else {
    ElMessage.success('保存成功')
  }
}
</script>

<style scoped>
.recognition-result {
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.top-bar-right {
  display: flex;
  gap: 12px;
}

.content-row {
  margin-bottom: 20px;
}

.preview-card {
  height: 100%;
  min-height: 500px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fafafa;
  border-radius: 4px;
}

.summary-card {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 16px 0;
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.summary-value.primary {
  color: #FF6600;
}

.summary-value.danger {
  color: #f56c6c;
}

.summary-value.warning {
  color: #e6a23c;
}

.table-card {
  margin-bottom: 20px;
}

.status-icon {
  font-size: 16px;
}

.table-footer {
  margin-top: 20px;
  text-align: right;
}

.table-footer .el-button {
  margin-left: 12px;
}

:deep(.el-button--primary) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-button--primary:hover) {
  background-color: #ff7a1f;
  border-color: #ff7a1f;
}

:deep(.el-button--primary:active) {
  background-color: #e65c00;
  border-color: #e65c00;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
