<template>
  <div class="contract-review-result">
    <!-- 顶部信息栏 -->
    <div class="result-header">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <div class="header-info">
        <h2>{{ contractName }}</h2>
        <div class="score-section">
          <div class="score">
            <span class="score-label">综合评分</span>
            <span class="score-value">{{ score }}</span>
            <span class="score-unit">分</span>
          </div>
          <div class="risk-stats">
            <el-tag type="danger" size="large">高风险 {{ highRiskCount }} 项</el-tag>
            <el-tag type="warning" size="large">中风险 {{ mediumRiskCount }} 项</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20" class="content-area">
      <!-- 左侧：合同原文 -->
      <el-col :span="10">
        <el-card class="contract-preview">
          <template #header>
            <span>合同原文</span>
          </template>
          <div class="contract-text">
            <h3>融资租赁合同</h3>
            <p><strong>合同编号：</strong>RZHT-2024-001</p>
            <p><strong>出租人：</strong>XX融资租赁有限公司</p>
            <p><strong>承租人：</strong>XX医院</p>
            <p><strong>签订日期：</strong>2024年1月15日</p>
            
            <h4>第一条 租赁物</h4>
            <p>1.1 租赁物名称及规格：医疗设备一批，详见附件《设备清单》。</p>
            <p>1.2 租赁物价值：人民币伍佰万元整（¥5,000,000.00）。</p>
            <p>1.3 租赁物所有权归出租人所有，承租人享有使用权。</p>
            
            <h4>第二条 租赁期限</h4>
            <p>2.1 租赁期限为36个月，自设备验收合格之日起计算。</p>
            <p>2.2 租赁期满后，承租人可选择留购、续租或退租。</p>
            
            <h4>第三条 租金及支付方式</h4>
            <p>3.1 租金总额：人民币伍佰伍拾万元整（¥5,500,000.00）。</p>
            <p>3.2 支付方式：按月等额支付，每月租金为人民币壹拾伍万贰仟柒佰柒拾捌元（¥152,778.00）。</p>
            <p>3.3 首期租金应于设备验收合格后5个工作日内支付。</p>
            <p>3.4 后续租金应于每月的15日前支付。</p>
            
            <h4>第四条 设备验收</h4>
            <p>4.1 设备到货后，承租人应在7个工作日内完成验收。</p>
            <p>4.2 验收合格后，承租人应签署《设备验收单》。</p>
            
            <h4>第五条 设备使用与维护</h4>
            <p>5.1 承租人应按照设备说明书正确使用设备。</p>
            <p>5.2 承租人负责设备的日常维护和保养。</p>
            <p>5.3 设备发生故障时，承租人应及时通知出租人。</p>
            
            <h4>第六条 违约责任</h4>
            <p>6.1 承租人逾期支付租金的，应按日支付逾期金额0.05%的违约金。</p>
            <p>6.2 承租人连续3个月未支付租金的，出租人有权解除合同并收回设备。</p>
            
            <h4>第七条 争议解决</h4>
            <p>7.1 本合同履行过程中发生的争议，双方应友好协商解决。</p>
            <p>7.2 协商不成的，任何一方可向出租人所在地人民法院提起诉讼。</p>
            
            <h4>第八条 其他约定</h4>
            <p>8.1 本合同一式两份，双方各执一份，具有同等法律效力。</p>
            <p>8.2 本合同自双方签字盖章之日起生效。</p>
            
            <p style="margin-top: 40px;"><strong>出租人（盖章）：</strong>XX融资租赁有限公司</p>
            <p><strong>承租人（盖章）：</strong>XX医院</p>
            <p><strong>签订日期：</strong>2024年1月15日</p>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：审核结果 -->
      <el-col :span="14">
        <!-- 必备条款检查 -->
        <el-card class="required-clauses">
          <template #header>
            <span>必备条款检查</span>
          </template>
          <div class="clause-summary">
            <el-statistic title="已包含" :value="includedClausesCount" suffix="/ 20" />
            <el-statistic title="缺失" :value="missingClausesCount" suffix="项" />
          </div>
          <div v-if="missingClauses.length > 0" class="missing-clauses">
            <h4>缺失条款：</h4>
            <ul>
              <li v-for="clause in missingClauses" :key="clause" class="missing-item">
                {{ clause }}
              </li>
            </ul>
          </div>
        </el-card>

        <!-- 风险条款列表 -->
        <el-card class="risk-clauses">
          <template #header>
            <span>风险条款列表</span>
          </template>
          
          <!-- 高风险 -->
          <div v-if="highRiskClauses.length > 0" class="risk-group">
            <h4 class="risk-title high-risk">
              <el-icon><WarningFilled /></el-icon>
              高风险条款
            </h4>
            <div v-for="clause in highRiskClauses" :key="clause.id" class="risk-item high">
              <div class="risk-content">
                <div class="risk-header">
                  <el-tag type="danger" size="small">高风险</el-tag>
                  <span class="clause-name">{{ clause.name }}</span>
                </div>
                <p class="risk-desc">{{ clause.description }}</p>
              </div>
              <el-button type="primary" link @click="showClauseDetail(clause)">
                查看详情
              </el-button>
            </div>
          </div>

          <!-- 中风险 -->
          <div v-if="mediumRiskClauses.length > 0" class="risk-group">
            <h4 class="risk-title medium-risk">
              <el-icon><Warning /></el-icon>
              中风险条款
            </h4>
            <div v-for="clause in mediumRiskClauses" :key="clause.id" class="risk-item medium">
              <div class="risk-content">
                <div class="risk-header">
                  <el-tag type="warning" size="small">中风险</el-tag>
                  <span class="clause-name">{{ clause.name }}</span>
                </div>
                <p class="risk-desc">{{ clause.description }}</p>
              </div>
              <el-button type="primary" link @click="showClauseDetail(clause)">
                查看详情
              </el-button>
            </div>
          </div>

          <!-- 低风险 -->
          <div v-if="lowRiskClauses.length > 0" class="risk-group">
            <h4 class="risk-title low-risk">
              <el-icon><InfoFilled /></el-icon>
              低风险条款
            </h4>
            <div v-for="clause in lowRiskClauses" :key="clause.id" class="risk-item low">
              <div class="risk-content">
                <div class="risk-header">
                  <el-tag type="info" size="small">低风险</el-tag>
                  <span class="clause-name">{{ clause.name }}</span>
                </div>
                <p class="risk-desc">{{ clause.description }}</p>
              </div>
              <el-button type="primary" link @click="showClauseDetail(clause)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Download">导出审核报告</el-button>
      <el-button :icon="Edit">在线批注</el-button>
      <el-button :icon="DocumentCopy">版本对比</el-button>
      <el-button type="success" :icon="Check">确认通过</el-button>
    </div>

    <!-- 条款详情对话框 -->
    <ClauseDetailDialog
      v-model="detailDialogVisible"
      :clause="selectedClause"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, WarningFilled, Warning, InfoFilled, Download, Edit, DocumentCopy, Check } from '@element-plus/icons-vue'
import ClauseDetailDialog from './ClauseDetailDialog.vue'

const router = useRouter()
const route = useRoute()

// 基本信息
const contractName = ref('XX医院融资租赁合同')
const score = ref(75)
const highRiskCount = ref(2)
const mediumRiskCount = ref(5)

// 必备条款
const includedClausesCount = ref(18)
const missingClausesCount = ref(2)
const missingClauses = ref([
  '保险条款',
  '提前终止条款'
])

// 风险条款数据
interface RiskClause {
  id: string
  name: string
  description: string
  riskLevel: 'high' | 'medium' | 'low'
  location: string
  originalText: string
  riskAnalysis: string
  suggestion: string
  references: string[]
}

const highRiskClauses = ref<RiskClause[]>([
  {
    id: '1',
    name: '违约金条款',
    description: '违约金比例过高（日0.05%），年化达18.25%，可能被认定为过高',
    riskLevel: 'high',
    location: '第六条 违约责任 第6.1款',
    originalText: '承租人逾期支付租金的，应按日支付逾期金额0.05%的违约金。',
    riskAnalysis: '根据《民法典》第585条规定，约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。本条款约定的违约金日利率0.05%，年化利率达18.25%，明显过高，存在被法院调减的风险。',
    suggestion: '建议将违约金比例降低至日0.03%以内（年化不超过10.95%），或设置违约金上限为逾期租金总额的30%。',
    references: [
      '《中华人民共和国民法典》第585条',
      '《最高人民法院关于适用<中华人民共和国民法典>合同编通则若干问题的解释》第60条',
      '《融资租赁司法解释》第20条'
    ]
  },
  {
    id: '2',
    name: '单方解除权',
    description: '出租人单方解除权条件过于宽松，缺乏对承租人的保护',
    riskLevel: 'high',
    location: '第六条 违约责任 第6.2款',
    originalText: '承租人连续3个月未支付租金的，出租人有权解除合同并收回设备。',
    riskAnalysis: '该条款赋予出租人直接解除合同的权利，未设置催告程序和补救期限，违反了《民法典》第563条关于合同解除的规定。承租人可能因临时资金周转困难而丧失合同权益，条款显失公平。',
    suggestion: '建议增加催告程序：出租人应书面催告承租人在15日内支付，逾期仍未支付的方可解除合同。同时明确设备收回后的价值评估和差额处理方式。',
    references: [
      '《中华人民共和国民法典》第563条',
      '《融资租赁司法解释》第12条',
      '《合同法司法解释二》第24条'
    ]
  }
])

const mediumRiskClauses = ref<RiskClause[]>([
  {
    id: '3',
    name: '租金支付时间',
    description: '租金支付时间约定不够明确，可能产生争议',
    riskLevel: 'medium',
    location: '第三条 租金及支付方式 第3.4款',
    originalText: '后续租金应于每月的15日前支付。',
    riskAnalysis: '"15日前"的表述不够精确，未明确是否包含15日当天、是否以银行到账时间为准。可能引发付款时间争议。',
    suggestion: '建议明确为"每月15日24:00前（含当日），以款项到达出租人指定账户时间为准"。',
    references: ['《融资租赁合同审查要点》第3.2.1条', '《商业银行法》相关规定']
  },
  {
    id: '4',
    name: '设备维护责任',
    description: '设备维护责任划分不够清晰',
    riskLevel: 'medium',
    location: '第五条 设备使用与维护 第5.2款',
    originalText: '承租人负责设备的日常维护和保养。',
    riskAnalysis: '仅约定日常维护由承租人负责，但未对大修、部件更换、技术升级等责任进行划分，可能产生维修费用争议。',
    suggestion: '建议明确大修、更换部件等责任归属，区分日常维护（承租人）和重大维修（出租人或协商）。',
    references: ['《融资租赁合同示范文本》第8条', '《民法典》第714条']
  },
  {
    id: '5',
    name: '验收期限',
    description: '验收期限较短，可能不足以完成全面检测',
    riskLevel: 'medium',
    location: '第四条 设备验收 第4.1款',
    originalText: '设备到货后，承租人应在7个工作日内完成验收。',
    riskAnalysis: '医疗设备通常需要安装调试、性能测试、计量检定等环节，7个工作日可能不足。超期未验收可能被视为默认通过。',
    suggestion: '建议根据设备复杂程度延长验收期限至10-15个工作日，并明确逾期未验收的处理方式。',
    references: ['《医疗器械使用质量监督管理办法》第10条', '《大型医疗设备管理办法》']
  },
  {
    id: '6',
    name: '争议解决管辖',
    description: '约定由出租人所在地法院管辖，对承租人不利',
    riskLevel: 'medium',
    location: '第七条 争议解决 第7.2款',
    originalText: '协商不成的，任何一方可向出租人所在地人民法院提起诉讼。',
    riskAnalysis: '约定由出租人所在地法院管辖，如果出租人在异地，承租人诉讼成本将显著增加，对承租人不够公平。',
    suggestion: '建议约定由合同签订地或被告所在地法院管辖，或采用仲裁方式解决争议。',
    references: ['《民事诉讼法》第35条', '《最高人民法院关于适用<民事诉讼法>的解释》第30条']
  },
  {
    id: '7',
    name: '租赁期满处理',
    description: '租赁期满后的处理方式约定不够详细',
    riskLevel: 'medium',
    location: '第二条 租赁期限 第2.2款',
    originalText: '租赁期满后，承租人可选择留购、续租或退租。',
    riskAnalysis: '留购价格、续租条件、退租时设备状态要求等均未明确。实践中留购价格争议最为常见。',
    suggestion: '建议明确留购价格计算方式（如名义价格1元/残值评估）、续租条件及租金调整方式、退租时设备状态要求及运输费用承担。',
    references: ['《民法典》第757条', '《融资租赁司法解释》第3条']
  }
])

const lowRiskClauses = ref<RiskClause[]>([
  {
    id: '8',
    name: '设备使用规范',
    description: '设备使用规范表述较为笼统',
    riskLevel: 'low',
    location: '第五条 设备使用与维护 第5.1款',
    originalText: '承租人应按照设备说明书正确使用设备。',
    riskAnalysis: '仅要求按说明书使用，但未列举禁止行为（如擅自改装、超负荷使用等），可能导致责任认定困难。',
    suggestion: '建议增加具体的使用规范和禁止行为清单，如：不得擅自改装、不得超负荷使用、不得转租或抵押等。',
    references: ['《融资租赁合同示范文本》第7条']
  },
  {
    id: '9',
    name: '故障通知义务',
    description: '故障通知时限未明确',
    riskLevel: 'low',
    location: '第五条 设备使用与维护 第5.3款',
    originalText: '设备发生故障时，承租人应及时通知出租人。',
    riskAnalysis: '"及时"的表述过于模糊，未明确具体时限。可能影响保险理赔或责任认定。',
    suggestion: '建议明确通知时限（如24小时内），并规定通知方式（书面/电话/邮件）。',
    references: ['《融资租赁合同审查要点》第5.3条']
  },
  {
    id: '10',
    name: '合同份数',
    description: '合同份数约定标准，无明显风险',
    riskLevel: 'low',
    location: '第八条 其他约定 第8.1款',
    originalText: '本合同一式两份，双方各执一份，具有同等法律效力。',
    riskAnalysis: '合同份数约定符合常规做法，无明显法律风险。',
    suggestion: '建议根据实际需要增加合同份数（如需向银行、监管部门提交时）。',
    references: ['《合同法》基本原则']
  }
])

// 条款详情对话框
const detailDialogVisible = ref(false)
const selectedClause = ref<RiskClause | null>(null)

const showClauseDetail = (clause: RiskClause) => {
  selectedClause.value = clause
  detailDialogVisible.value = true
}

const goBack = () => {
  router.push('/contract-review')
}
</script>

<style scoped>
.contract-review-result {
  padding: 20px;
}

.result-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-info {
  margin-top: 15px;
}

.header-info h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #303133;
}

.score-section {
  display: flex;
  align-items: center;
  gap: 30px;
}

.score {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.score-label {
  font-size: 14px;
  color: #606266;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: #FF6600;
}

.score-unit {
  font-size: 16px;
  color: #909399;
}

.risk-stats {
  display: flex;
  gap: 15px;
}

.content-area {
  margin-bottom: 20px;
}

.contract-preview {
  height: calc(100vh - 320px);
}

.contract-text {
  height: calc(100vh - 400px);
  overflow-y: auto;
  line-height: 1.8;
  color: #303133;
}

.contract-text h3 {
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
}

.contract-text h4 {
  font-size: 16px;
  margin: 20px 0 10px 0;
  color: #FF6600;
}

.contract-text p {
  margin: 8px 0;
  text-indent: 2em;
}

.required-clauses {
  margin-bottom: 20px;
}

.clause-summary {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.missing-clauses h4 {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.missing-clauses ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.missing-item {
  color: #F56C6C;
  padding: 5px 0;
  font-size: 14px;
}

.missing-item::before {
  content: '• ';
  margin-right: 5px;
}

.risk-clauses {
  max-height: calc(100vh - 520px);
  overflow-y: auto;
}

.risk-group {
  margin-bottom: 25px;
}

.risk-group:last-child {
  margin-bottom: 0;
}

.risk-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #EBEEF5;
}

.risk-title.high-risk {
  color: #F56C6C;
}

.risk-title.medium-risk {
  color: #E6A23C;
}

.risk-title.low-risk {
  color: #909399;
}

.risk-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  border-left: 4px solid;
  background: #F5F7FA;
}

.risk-item.high {
  border-left-color: #F56C6C;
}

.risk-item.medium {
  border-left-color: #E6A23C;
}

.risk-item.low {
  border-left-color: #909399;
}

.risk-content {
  flex: 1;
}

.risk-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.clause-name {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.risk-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.action-bar {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>
