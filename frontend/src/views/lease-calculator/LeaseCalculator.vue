<template>
  <div class="lease-calculator">
    <div class="page-header">
      <h2 class="page-title">租赁方案计算</h2>
    </div>

    <el-card class="calculator-card">
      <template #header>
        <div class="card-header">
          <span>租赁方案计算器</span>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 左侧：参数录入表单 -->
        <el-col :xs="24" :sm="24" :md="10" :lg="8">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="calculator-form"
          >
            <el-form-item label="融资金额" prop="financingAmount">
              <el-input
                v-model.number="formData.financingAmount"
                placeholder="请输入融资金额"
                type="number"
              >
                <template #append>元</template>
              </el-input>
            </el-form-item>

            <el-form-item label="租赁期限" prop="leaseTerm">
              <el-input
                v-model.number="formData.leaseTerm"
                placeholder="请输入租赁期限"
                type="number"
              >
                <template #append>月</template>
              </el-input>
            </el-form-item>

            <el-form-item label="年利率" prop="annualRate">
              <el-input
                v-model.number="formData.annualRate"
                placeholder="请输入年利率"
                type="number"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>

            <el-form-item label="还款方式" prop="repaymentMethod">
              <el-radio-group v-model="formData.repaymentMethod">
                <el-radio value="equal_payment">等额租金</el-radio>
                <el-radio value="equal_principal">等额本金</el-radio>
                <el-radio value="interest_first">先息后本</el-radio>
                <el-radio value="custom" disabled>自定义</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="首付比例" prop="downPaymentRatio">
              <el-input
                v-model.number="formData.downPaymentRatio"
                placeholder="可选，0-50%"
                type="number"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>

            <el-form-item label="保证金比例" prop="depositRatio">
              <el-input
                v-model.number="formData.depositRatio"
                placeholder="可选，0-30%"
                type="number"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>

            <el-form-item label="留购价" prop="residualValue">
              <el-input
                v-model.number="formData.residualValue"
                placeholder="可选"
                type="number"
              >
                <template #append>元</template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="calculating"
                @click="handleCalculate"
                style="background-color: #FF6600; border-color: #FF6600; width: 100%;"
              >
                计算方案
              </el-button>
            </el-form-item>

            <el-form-item v-if="calculationResult">
              <el-button
                type="success"
                @click="handleSavePlan"
                style="width: 100%;"
              >
                保存方案
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!-- 右侧：还款计划表 -->
        <el-col :xs="24" :sm="24" :md="14" :lg="16">
          <div v-if="!calculationResult" class="empty-result">
            <el-empty description="请填写参数并点击计算" />
          </div>

          <div v-else class="result-container">
            <!-- 汇总信息 -->
            <el-descriptions :column="3" border class="summary-info">
              <el-descriptions-item label="总租金">
                <span class="amount-text">{{ formatAmount(calculationResult.totalRent) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="总利息">
                <span class="amount-text">{{ formatAmount(calculationResult.totalInterest) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="IRR">
                <span class="rate-text">{{ formatPercent(calculationResult.irr) }}</span>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 还款计划表 -->
            <el-table
              :data="calculationResult.schedule"
              border
              stripe
              max-height="500"
              class="schedule-table"
            >
              <el-table-column prop="period" label="期数" width="80" align="center" />
              <el-table-column prop="date" label="应还日期" width="120" align="center" />
              <el-table-column prop="rent" label="租金" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.rent) }}
                </template>
              </el-table-column>
              <el-table-column prop="principal" label="本金" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.principal) }}
                </template>
              </el-table-column>
              <el-table-column prop="interest" label="利息" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.interest) }}
                </template>
              </el-table-column>
              <el-table-column prop="remainingPrincipal" label="剩余本金" align="right">
                <template #default="{ row }">
                  {{ formatAmount(row.remainingPrincipal) }}
                </template>
              </el-table-column>
            </el-table>

            <!-- 导出按钮 -->
            <div class="export-actions">
              <el-button type="primary" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出 Excel
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 方案对比区域 -->
    <el-card v-if="savedPlans.length > 0" class="comparison-card">
      <template #header>
        <div class="card-header">
          <span>方案对比（已保存 {{ savedPlans.length }} 个方案）</span>
          <el-button type="danger" size="small" @click="handleClearPlans">清空</el-button>
        </div>
      </template>

      <el-table :data="savedPlans" border stripe>
        <el-table-column prop="name" label="方案名称" width="150" />
        <el-table-column label="融资金额" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.params.financingAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="params.leaseTerm" label="期限(月)" width="100" align="center" />
        <el-table-column label="年利率" width="100" align="center">
          <template #default="{ row }">
            {{ row.params.annualRate }}%
          </template>
        </el-table-column>
        <el-table-column label="还款方式" width="120" align="center">
          <template #default="{ row }">
            {{ getRepaymentMethodText(row.params.repaymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column label="总租金" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.result.totalRent) }}
          </template>
        </el-table-column>
        <el-table-column label="总利息" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.result.totalInterest) }}
          </template>
        </el-table-column>
        <el-table-column label="IRR" width="100" align="center">
          <template #default="{ row }">
            {{ formatPercent(row.result.irr) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ $index }">
            <el-button type="danger" size="small" link @click="handleDeletePlan($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 租赁方案计算器 - 主页面组件
 * 
 * 功能：
 * 1. 左侧表单：录入租赁参数
 * 2. 右侧表格：展示还款计划
 * 3. 方案对比：保存多个方案并列对比
 * 4. Excel 导出
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import {
  calculateLease,
  formatAmount,
  formatPercent,
  type LeaseParams,
  type CalculationResult,
  type SavedPlan,
} from './calculator'

// ========== 表单相关 ==========

/** 表单引用，用于触发验证 */
const formRef = ref<FormInstance>()

/** 是否正在计算（loading 状态） */
const calculating = ref(false)

/** 表单数据 */
const formData = reactive<LeaseParams>({
  financingAmount: undefined as any,
  leaseTerm: undefined as any,
  annualRate: undefined as any,
  repaymentMethod: 'equal_payment',
  downPaymentRatio: 0,
  depositRatio: 0,
  residualValue: 0,
})

// ========== 表单验证规则 ==========

/** 验证融资金额：必填，必须大于0 */
const validateAmount = (_rule: any, value: any, callback: any) => {
  if (value === undefined || value === null || value === '') {
    callback(new Error('请输入融资金额'))
  } else if (isNaN(Number(value)) || Number(value) <= 0) {
    callback(new Error('融资金额必须大于0'))
  } else {
    callback()
  }
}

/** 验证租赁期限：必填，1-120个月 */
const validateTerm = (_rule: any, value: any, callback: any) => {
  if (value === undefined || value === null || value === '') {
    callback(new Error('请输入租赁期限'))
  } else if (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 120) {
    callback(new Error('租赁期限为1-120个月的整数'))
  } else {
    callback()
  }
}

/** 验证年利率：必填，0-30% */
const validateRate = (_rule: any, value: any, callback: any) => {
  if (value === undefined || value === null || value === '') {
    callback(new Error('请输入年利率'))
  } else if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 30) {
    callback(new Error('年利率范围为0-30%'))
  } else {
    callback()
  }
}

/** 验证首付比例：可选，0-50% */
const validateDownPayment = (_rule: any, value: any, callback: any) => {
  if (value !== undefined && value !== null && value !== '' && value !== 0) {
    if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 50) {
      callback(new Error('首付比例范围为0-50%'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/** 验证保证金比例：可选，0-30% */
const validateDeposit = (_rule: any, value: any, callback: any) => {
  if (value !== undefined && value !== null && value !== '' && value !== 0) {
    if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 30) {
      callback(new Error('保证金比例范围为0-30%'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/** 验证留购价：可选，>=0 */
const validateResidual = (_rule: any, value: any, callback: any) => {
  if (value !== undefined && value !== null && value !== '' && value !== 0) {
    if (isNaN(Number(value)) || Number(value) < 0) {
      callback(new Error('留购价不能为负数'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/** 表单验证规则集合 */
const formRules = reactive<FormRules>({
  financingAmount: [{ validator: validateAmount, trigger: 'blur' }],
  leaseTerm: [{ validator: validateTerm, trigger: 'blur' }],
  annualRate: [{ validator: validateRate, trigger: 'blur' }],
  repaymentMethod: [{ required: true, message: '请选择还款方式', trigger: 'change' }],
  downPaymentRatio: [{ validator: validateDownPayment, trigger: 'blur' }],
  depositRatio: [{ validator: validateDeposit, trigger: 'blur' }],
  residualValue: [{ validator: validateResidual, trigger: 'blur' }],
})

// ========== 计算结果 ==========

/** 当前计算结果 */
const calculationResult = ref<CalculationResult | null>(null)

/** 已保存的方案列表（用于对比） */
const savedPlans = ref<SavedPlan[]>([])

// ========== 方法 ==========

/**
 * 还款方式文本映射
 */
const getRepaymentMethodText = (method: string): string => {
  const map: Record<string, string> = {
    equal_payment: '等额租金',
    equal_principal: '等额本金',
    interest_first: '先息后本',
    custom: '自定义',
  }
  return map[method] || method
}

/**
 * 点击"计算方案"按钮
 * 先验证表单，通过后执行计算
 */
const handleCalculate = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return
  } catch {
    ElMessage.warning('请检查表单填写是否正确')
    return
  }

  calculating.value = true

  // 模拟短暂延迟，让用户感知到计算过程
  setTimeout(() => {
    try {
      calculationResult.value = calculateLease({
        ...formData,
        financingAmount: Number(formData.financingAmount),
        leaseTerm: Number(formData.leaseTerm),
        annualRate: Number(formData.annualRate),
        downPaymentRatio: Number(formData.downPaymentRatio) || 0,
        depositRatio: Number(formData.depositRatio) || 0,
        residualValue: Number(formData.residualValue) || 0,
      })
      ElMessage.success('计算完成')
    } catch (err) {
      ElMessage.error('计算出错，请检查参数')
      console.error(err)
    } finally {
      calculating.value = false
    }
  }, 300)
}

/**
 * 保存当前方案（用于方案对比）
 */
const handleSavePlan = async () => {
  if (!calculationResult.value) return

  try {
    const { value: name } = await ElMessageBox.prompt('请输入方案名称', '保存方案', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '方案名称不能为空',
      inputValue: `方案${savedPlans.value.length + 1}`,
    })

    savedPlans.value.push({
      name: name || `方案${savedPlans.value.length + 1}`,
      params: { ...formData },
      result: { ...calculationResult.value },
    })

    ElMessage.success('方案已保存')
  } catch {
    // 用户取消
  }
}

/**
 * 删除某个已保存的方案
 */
const handleDeletePlan = (index: number) => {
  savedPlans.value.splice(index, 1)
  ElMessage.success('方案已删除')
}

/**
 * 清空所有已保存的方案
 */
const handleClearPlans = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有已保存的方案吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    savedPlans.value = []
    ElMessage.success('已清空')
  } catch {
    // 用户取消
  }
}

/**
 * 导出还款计划到 Excel 文件
 */
const handleExport = () => {
  if (!calculationResult.value) return

  // 构造表头和数据
  const headers = ['期数', '应还日期', '租金', '本金', '利息', '剩余本金']
  const rows = calculationResult.value.schedule.map(item => [
    item.period,
    item.date,
    item.rent,
    item.principal,
    item.interest,
    item.remainingPrincipal,
  ])

  // 添加汇总行
  rows.push([])
  rows.push(['汇总', '', calculationResult.value.totalRent, '', calculationResult.value.totalInterest, ''])
  rows.push(['IRR', formatPercent(calculationResult.value.irr), '', '', '', ''])

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 },  // 期数
    { wch: 14 }, // 应还日期
    { wch: 16 }, // 租金
    { wch: 16 }, // 本金
    { wch: 16 }, // 利息
    { wch: 16 }, // 剩余本金
  ]

  // 创建工作簿并下载
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '还款计划')
  XLSX.writeFile(wb, `租赁方案_还款计划_${new Date().toISOString().slice(0, 10)}.xlsx`)

  ElMessage.success('导出成功')
}
</script>

<style scoped>
/* ========== 整体布局 ========== */
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

.lease-calculator {
  padding: 0;
}

.calculator-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* ========== 表单样式 ========== */
.calculator-form {
  padding: 10px 0;
}

.calculator-form :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.calculator-form :deep(.el-radio) {
  margin-right: 0;
}

/* 计算按钮悬浮效果 */
.calculator-form :deep(.el-button--primary:hover) {
  background-color: #e55c00 !important;
  border-color: #e55c00 !important;
}

/* ========== 右侧结果区域 ========== */
.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.result-container {
  padding: 0 10px;
}

/* 汇总信息 */
.summary-info {
  margin-bottom: 20px;
}

.amount-text {
  font-weight: 600;
  color: #FF6600;
  font-size: 16px;
}

.rate-text {
  font-weight: 600;
  color: #409EFF;
  font-size: 16px;
}

/* 还款计划表 */
.schedule-table {
  margin-bottom: 20px;
}

/* 导出按钮区域 */
.export-actions {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* ========== 方案对比区域 ========== */
.comparison-card {
  margin-bottom: 20px;
}

/* ========== 响应式布局 ========== */
@media (max-width: 768px) {
  .calculator-form {
    padding: 0;
  }

  .calculator-form :deep(.el-form-item__label) {
    width: 100px !important;
  }

  .result-container {
    padding: 10px 0;
  }

  .summary-info :deep(.el-descriptions__cell) {
    padding: 8px !important;
  }

  .amount-text,
  .rate-text {
    font-size: 14px;
  }
}
</style>
