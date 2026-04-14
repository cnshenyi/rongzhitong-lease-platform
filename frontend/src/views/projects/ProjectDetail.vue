<template>
  <div class="project-detail">
    <!-- 页面标题 + 返回按钮 -->
    <div class="page-header">
      <div class="page-header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h2>{{ projectData.name || '项目详情' }}</h2>
        <el-tag :type="getStatusType(projectData.status)" size="large" class="status-tag">
          {{ getStatusText(projectData.status) }}
        </el-tag>
      </div>
      <div class="page-header-right">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <el-card v-loading="loading">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="info-section">
            <h3 class="section-title">项目基本信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="项目编号">{{ projectData.projectNo }}</el-descriptions-item>
              <el-descriptions-item label="项目名称">{{ projectData.name }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ projectData.customer }}</el-descriptions-item>
              <el-descriptions-item label="项目金额">
                <span class="amount-text">¥ {{ formatAmount(projectData.amount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="租赁物类型">{{ projectData.leaseType }}</el-descriptions-item>
              <el-descriptions-item label="项目状态">
                <el-tag :type="getStatusType(projectData.status)">
                  {{ getStatusText(projectData.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ projectData.createTime }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ projectData.updateTime }}</el-descriptions-item>
              <el-descriptions-item label="项目描述" :span="2">{{ projectData.description }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <h3 class="section-title">客户信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="客户名称">{{ projectData.customerDetail?.name }}</el-descriptions-item>
              <el-descriptions-item label="联系人">{{ projectData.customerDetail?.contact }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ projectData.customerDetail?.phone }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ projectData.customerDetail?.email }}</el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">{{ projectData.customerDetail?.address }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <h3 class="section-title">租赁条款</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="租赁期限">{{ projectData.leaseTerm }}</el-descriptions-item>
              <el-descriptions-item label="年利率">{{ projectData.annualRate }}</el-descriptions-item>
              <el-descriptions-item label="还款方式">{{ projectData.repaymentMethod }}</el-descriptions-item>
              <el-descriptions-item label="首付比例">{{ projectData.downPaymentRate }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <!-- 清单明细 -->
        <el-tab-pane label="清单明细" name="items">
          <div class="tab-toolbar">
            <el-button type="primary" size="small" :icon="Plus">添加设备</el-button>
          </div>
          <el-table :data="itemsData" stripe border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="model" label="型号" width="120" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="单价（元）" width="140" align="right">
              <template #default="{ row }">
                {{ formatAmount(row.unitPrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="总价（元）" width="140" align="right">
              <template #default="{ row }">
                {{ formatAmount(row.totalPrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150" />
          </el-table>
          <div class="items-summary">
            <span>合计金额：<strong class="amount-text">¥ {{ formatAmount(itemsTotalAmount) }}</strong></span>
          </div>
        </el-tab-pane>

        <!-- 发票信息 -->
        <el-tab-pane label="发票信息" name="invoices">
          <el-table :data="invoicesData" stripe border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="invoiceNo" label="发票号码" width="180" />
            <el-table-column prop="invoiceType" label="发票类型" width="140" />
            <el-table-column prop="amount" label="发票金额（元）" width="160" align="right">
              <template #default="{ row }">
                {{ formatAmount(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率" width="80" align="center" />
            <el-table-column prop="taxAmount" label="税额（元）" width="140" align="right">
              <template #default="{ row }">
                {{ formatAmount(row.taxAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="invoiceDate" label="开票日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已开具' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="invoicesData.length === 0" description="暂无发票信息" />
        </el-tab-pane>

        <!-- 合同信息 -->
        <el-tab-pane label="合同信息" name="contracts">
          <el-table :data="contractsData" stripe border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="contractNo" label="合同编号" width="180" />
            <el-table-column prop="contractName" label="合同名称" min-width="200" />
            <el-table-column prop="contractType" label="合同类型" width="120" />
            <el-table-column prop="signDate" label="签署日期" width="120" />
            <el-table-column prop="startDate" label="起始日期" width="120" />
            <el-table-column prop="endDate" label="终止日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getContractStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default>
                <el-button link type="primary">查看</el-button>
                <el-button link type="primary">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="contractsData.length === 0" description="暂无合同信息" />
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane label="操作日志" name="logs">
          <el-timeline>
            <el-timeline-item
              v-for="log in logsData"
              :key="log.id"
              :timestamp="log.time"
              :type="getLogType(log.action)"
              placement="top"
            >
              <el-card class="log-card">
                <div class="log-content">
                  <span class="log-operator">{{ log.operator }}</span>
                  <span class="log-action">{{ log.action }}</span>
                </div>
                <div class="log-detail" v-if="log.detail">{{ log.detail }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="logsData.length === 0" description="暂无操作日志" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const activeTab = ref('basic')

// 项目详情接口类型
interface CustomerDetail {
  name: string
  contact: string
  phone: string
  email: string
  address: string
}

interface ProjectData {
  id: number
  projectNo: string
  name: string
  customer: string
  amount: number
  leaseType: string
  status: string
  description: string
  createTime: string
  updateTime: string
  customerDetail: CustomerDetail | null
  leaseTerm: string
  annualRate: string
  repaymentMethod: string
  downPaymentRate: string
}

// 项目数据
const projectData = reactive<ProjectData>({
  id: 0,
  projectNo: '',
  name: '',
  customer: '',
  amount: 0,
  leaseType: '',
  status: '',
  description: '',
  createTime: '',
  updateTime: '',
  customerDetail: null,
  leaseTerm: '',
  annualRate: '',
  repaymentMethod: '',
  downPaymentRate: '',
})

// 清单明细数据
const itemsData = ref<any[]>([])

// 发票数据
const invoicesData = ref<any[]>([])

// 合同数据
const contractsData = ref<any[]>([])

// 操作日志数据
const logsData = ref<any[]>([])

// 清单合计金额
const itemsTotalAmount = computed(() => {
  return itemsData.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
})

// ============ Mock 数据 ============

// TODO: 替换为真实API - 获取项目详情
const mockProjectMap: Record<string, any> = {
  '1': {
    id: 1,
    projectNo: 'PRJ202604001',
    name: '某三甲医院CT设备融资租赁',
    customer: '北京协和医院',
    amount: 8500000,
    leaseType: '医疗设备',
    status: 'in_progress',
    description: 'CT设备采购融资租赁项目，包含1台CT扫描仪及配套设备，租赁期36个月，用于医院影像科室升级。',
    createTime: '2026-04-10 10:30:00',
    updateTime: '2026-04-13 15:20:00',
    customerDetail: {
      name: '北京协和医院',
      contact: '张主任',
      phone: '010-12345678',
      email: 'zhang@pumch.cn',
      address: '北京市东城区帅府园1号',
    },
    leaseTerm: '36个月',
    annualRate: '6.5%',
    repaymentMethod: '等额本息',
    downPaymentRate: '20%',
  },
  '2': {
    id: 2,
    projectNo: 'PRJ202604002',
    name: '工程机械设备租赁项目',
    customer: '中建三局',
    amount: 12000000,
    leaseType: '工程机械',
    status: 'in_progress',
    description: '挖掘机、推土机等工程机械设备融资租赁，用于基础设施建设项目。',
    createTime: '2026-04-11 14:20:00',
    updateTime: '2026-04-14 09:00:00',
    customerDetail: {
      name: '中建三局',
      contact: '李经理',
      phone: '027-87654321',
      email: 'li@cscec3b.com.cn',
      address: '湖北省武汉市武昌区中南路12号',
    },
    leaseTerm: '48个月',
    annualRate: '5.8%',
    repaymentMethod: '等额本金',
    downPaymentRate: '15%',
  },
  '3': {
    id: 3,
    projectNo: 'PRJ202604003',
    name: '办公设备融资租赁',
    customer: '某科技公司',
    amount: 500000,
    leaseType: '办公设备',
    status: 'completed',
    description: '电脑、打印机等办公设备融资租赁，支持企业办公设备升级。',
    createTime: '2026-04-08 09:15:00',
    updateTime: '2026-04-12 17:00:00',
    customerDetail: {
      name: '某科技公司',
      contact: '王总',
      phone: '021-11223344',
      email: 'wang@techco.com',
      address: '上海市浦东新区张江高科技园区',
    },
    leaseTerm: '24个月',
    annualRate: '7.0%',
    repaymentMethod: '等额本息',
    downPaymentRate: '10%',
  },
  '4': {
    id: 4,
    projectNo: 'PRJ202604004',
    name: '物流车辆融资租赁',
    customer: '顺丰速运',
    amount: 6000000,
    leaseType: '运输车辆',
    status: 'draft',
    description: '新能源物流车辆采购融资租赁，用于城市配送业务扩展。',
    createTime: '2026-04-12 16:45:00',
    updateTime: '2026-04-12 16:45:00',
    customerDetail: {
      name: '顺丰速运有限公司',
      contact: '赵经理',
      phone: '0755-33445566',
      email: 'zhao@sf-express.com',
      address: '广东省深圳市福田区新洲十一街',
    },
    leaseTerm: '60个月',
    annualRate: '5.5%',
    repaymentMethod: '等额本金',
    downPaymentRate: '25%',
  },
  '5': {
    id: 5,
    projectNo: 'PRJ202604005',
    name: '智能制造设备融资租赁',
    customer: '富士康科技集团',
    amount: 15000000,
    leaseType: '工程机械',
    status: 'closed',
    description: '自动化生产线设备采购融资租赁，包含机械臂、传送线等设备。',
    createTime: '2026-04-05 11:00:00',
    updateTime: '2026-04-10 14:30:00',
    customerDetail: {
      name: '富士康科技集团',
      contact: '陈总监',
      phone: '0755-77889900',
      email: 'chen@foxconn.com',
      address: '广东省深圳市龙华区富士康科技园',
    },
    leaseTerm: '36个月',
    annualRate: '6.0%',
    repaymentMethod: '等额本息',
    downPaymentRate: '20%',
  },
}

// TODO: 替换为真实API - 获取清单明细
const mockItemsMap: Record<string, any[]> = {
  '1': [
    { id: 1, equipmentName: 'CT扫描仪（128层）', brand: 'GE Healthcare', model: 'Revolution CT', quantity: 1, unitPrice: 6500000, totalPrice: 6500000, remark: '含安装调试' },
    { id: 2, equipmentName: '工作站及图像处理系统', brand: 'GE Healthcare', model: 'AW Server 3.2', quantity: 2, unitPrice: 500000, totalPrice: 1000000, remark: '配套设备' },
    { id: 3, equipmentName: '高压注射器', brand: 'Medrad', model: 'Stellant', quantity: 2, unitPrice: 250000, totalPrice: 500000, remark: '双筒高压注射器' },
    { id: 4, equipmentName: 'UPS不间断电源', brand: '施耐德', model: 'Galaxy VS 40kVA', quantity: 1, unitPrice: 500000, totalPrice: 500000, remark: '保障设备稳定供电' },
  ],
  '2': [
    { id: 1, equipmentName: '液压挖掘机', brand: '卡特彼勒', model: 'CAT 320GC', quantity: 3, unitPrice: 1500000, totalPrice: 4500000, remark: '20吨级' },
    { id: 2, equipmentName: '推土机', brand: '小松', model: 'D65PX-18', quantity: 2, unitPrice: 2000000, totalPrice: 4000000, remark: '' },
    { id: 3, equipmentName: '装载机', brand: '临工', model: 'L956F', quantity: 5, unitPrice: 700000, totalPrice: 3500000, remark: '5吨级' },
  ],
}

// TODO: 替换为真实API - 获取发票信息
const mockInvoicesMap: Record<string, any[]> = {
  '1': [
    { id: 1, invoiceNo: 'INV20260410001', invoiceType: '增值税专用发票', amount: 6500000, taxRate: '13%', taxAmount: 845000, invoiceDate: '2026-04-10', status: '已开具' },
    { id: 2, invoiceNo: 'INV20260411002', invoiceType: '增值税专用发票', amount: 2000000, taxRate: '13%', taxAmount: 260000, invoiceDate: '2026-04-11', status: '已开具' },
  ],
  '2': [
    { id: 1, invoiceNo: 'INV20260412001', invoiceType: '增值税专用发票', amount: 12000000, taxRate: '13%', taxAmount: 1560000, invoiceDate: '2026-04-12', status: '已开具' },
  ],
}

// TODO: 替换为真实API - 获取合同信息
const mockContractsMap: Record<string, any[]> = {
  '1': [
    { id: 1, contractNo: 'CON20260410001', contractName: '融资租赁合同（CT设备）', contractType: '融资租赁', signDate: '2026-04-10', startDate: '2026-04-15', endDate: '2029-04-14', status: '已签署' },
    { id: 2, contractNo: 'CON20260410002', contractName: '设备买卖合同', contractType: '采购合同', signDate: '2026-04-10', startDate: '2026-04-10', endDate: '2026-05-10', status: '已签署' },
  ],
  '2': [
    { id: 1, contractNo: 'CON20260411001', contractName: '融资租赁合同（工程机械）', contractType: '融资租赁', signDate: '2026-04-11', startDate: '2026-04-20', endDate: '2030-04-19', status: '待签署' },
  ],
}

// TODO: 替换为真实API - 获取操作日志
const mockLogsMap: Record<string, any[]> = {
  '1': [
    { id: 1, operator: '张三', action: '创建项目', time: '2026-04-10 10:30:00', detail: '创建了项目「某三甲医院CT设备融资租赁」' },
    { id: 2, operator: '李四', action: '提交审批', time: '2026-04-10 14:00:00', detail: '提交项目审批，等待风控审核' },
    { id: 3, operator: 'AI风控引擎', action: '风控审核通过', time: '2026-04-10 14:05:00', detail: 'AI风控评分：92分，风险等级：低，建议通过' },
    { id: 4, operator: '王五', action: '合同签署', time: '2026-04-10 16:30:00', detail: '融资租赁合同已签署' },
    { id: 5, operator: '系统', action: '状态变更', time: '2026-04-10 16:35:00', detail: '项目状态从"草稿"变更为"进行中"' },
    { id: 6, operator: '张三', action: '上传发票', time: '2026-04-11 09:00:00', detail: '上传了2张增值税专用发票' },
  ],
  '2': [
    { id: 1, operator: '李四', action: '创建项目', time: '2026-04-11 14:20:00', detail: '创建了项目「工程机械设备租赁项目」' },
    { id: 2, operator: '李四', action: '提交审批', time: '2026-04-12 09:00:00', detail: '提交项目审批' },
    { id: 3, operator: 'AI风控引擎', action: '风控审核通过', time: '2026-04-12 09:10:00', detail: 'AI风控评分：88分，风险等级：中低，建议通过' },
  ],
}

// 加载项目详情
const loadProjectDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id as string

    // TODO: 替换为真实API调用
    // const response = await getProjectDetail(id)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const data = mockProjectMap[id]
    if (data) {
      Object.assign(projectData, data)
    } else {
      ElMessage.error('项目不存在')
      router.push('/projects')
      return
    }

    // 加载清单明细
    itemsData.value = mockItemsMap[id] || []

    // 加载发票信息
    invoicesData.value = mockInvoicesMap[id] || []

    // 加载合同信息
    contractsData.value = mockContractsMap[id] || []

    // 加载操作日志
    logsData.value = mockLogsMap[id] || []
  } catch (error) {
    ElMessage.error('加载项目详情失败')
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/projects')
}

// 编辑项目
const handleEdit = () => {
  // TODO: 跳转到编辑页面或打开编辑对话框
  ElMessage.info('编辑功能开发中')
}

// 格式化金额（千分位）
const formatAmount = (amount: number) => {
  if (!amount && amount !== 0) return '-'
  return amount.toLocaleString('zh-CN')
}

// 状态标签类型
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

// 合同状态标签类型
const getContractStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '已签署': 'success',
    '待签署': 'warning',
    '已过期': 'danger',
    '已终止': 'info',
  }
  return typeMap[status] || 'info'
}

// 操作日志类型
const getLogType = (action: string) => {
  if (action.includes('创建')) return 'primary' as const
  if (action.includes('审核') || action.includes('审批')) return 'success' as const
  if (action.includes('签署') || action.includes('上传')) return 'warning' as const
  if (action.includes('变更')) return '' as const
  return 'primary' as const
}

onMounted(() => {
  loadProjectDetail()
})
</script>

<style scoped>
.project-detail {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header-left h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.status-tag {
  font-size: 14px;
}

.detail-tabs {
  min-height: 400px;
}

.info-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #FF6600;
}

.amount-text {
  color: #FF6600;
  font-weight: 600;
  font-size: 16px;
}

.tab-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.items-summary {
  margin-top: 16px;
  text-align: right;
  padding: 12px 16px;
  background-color: #fafafa;
  border-radius: 4px;
  font-size: 14px;
}

.log-card {
  margin-bottom: 0;
}

.log-card :deep(.el-card__body) {
  padding: 12px 16px;
}

.log-content {
  display: flex;
  gap: 8px;
  align-items: center;
}

.log-operator {
  font-weight: 600;
  color: #333;
}

.log-action {
  color: #666;
}

.log-detail {
  margin-top: 8px;
  font-size: 13px;
  color: #999;
}

/* 覆盖 Element Plus Tab 样式，使用主题色 */
.detail-tabs :deep(.el-tabs__active-bar) {
  background-color: #FF6600;
}

.detail-tabs :deep(.el-tabs__item.is-active) {
  color: #FF6600;
}

.detail-tabs :deep(.el-tabs__item:hover) {
  color: #FF6600;
}
</style>
