/**
 * 租赁方案计算模块
 * 包含等额租金、等额本金、先息后本三种还款方式的计算逻辑
 * 以及 IRR（内部收益率）的牛顿迭代法计算
 */

import dayjs from 'dayjs'

/** 单期还款计划 */
export interface ScheduleItem {
  /** 期数 */
  period: number
  /** 应还日期 (YYYY-MM-DD) */
  date: string
  /** 当期租金 = 本金 + 利息 */
  rent: number
  /** 当期归还本金 */
  principal: number
  /** 当期利息 */
  interest: number
  /** 期末剩余本金 */
  remainingPrincipal: number
}

/** 计算结果 */
export interface CalculationResult {
  /** 还款计划明细 */
  schedule: ScheduleItem[]
  /** 总租金 */
  totalRent: number
  /** 总利息 */
  totalInterest: number
  /** 内部收益率 IRR (年化，百分比形式如 8.5) */
  irr: number
}

/** 表单参数 */
export interface LeaseParams {
  /** 融资金额 */
  financingAmount: number
  /** 租赁期限（月） */
  leaseTerm: number
  /** 年利率（百分比，如 8.5 代表 8.5%） */
  annualRate: number
  /** 还款方式 */
  repaymentMethod: 'equal_payment' | 'equal_principal' | 'interest_first' | 'custom'
  /** 首付比例（百分比） */
  downPaymentRatio: number
  /** 保证金比例（百分比） */
  depositRatio: number
  /** 留购价 */
  residualValue: number
}

/** 已保存的方案 */
export interface SavedPlan {
  name: string
  params: LeaseParams
  result: CalculationResult
}

/**
 * 四舍五入到2位小数
 */
function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/**
 * 等额租金（等额本息）计算
 * PMT = P * r * (1+r)^n / ((1+r)^n - 1)
 * 其中 P 为贷款本金，r 为月利率，n 为期数
 */
function calcEqualPayment(principal: number, monthlyRate: number, periods: number, residualValue: number): ScheduleItem[] {
  const schedule: ScheduleItem[] = []
  const startDate = dayjs()

  // 调整本金：考虑留购价（留购价在最后一期支付，不影响每期PMT计算）
  // PMT 公式
  let pmt: number
  if (monthlyRate === 0) {
    // 零利率特殊处理
    pmt = principal / periods
  } else {
    const factor = Math.pow(1 + monthlyRate, periods)
    pmt = principal * monthlyRate * factor / (factor - 1)
  }

  let remaining = principal

  for (let i = 1; i <= periods; i++) {
    const interest = round2(remaining * monthlyRate)
    let principalPayment = round2(pmt - interest)
    let rent = round2(pmt)

    // 最后一期处理尾差，确保剩余本金归零
    if (i === periods) {
      principalPayment = round2(remaining)
      interest !== undefined // keep interest
      rent = round2(principalPayment + interest + residualValue)
    }

    remaining = round2(remaining - principalPayment)
    // 防止浮点误差导致负数
    if (remaining < 0) remaining = 0

    schedule.push({
      period: i,
      date: startDate.add(i, 'month').format('YYYY-MM-DD'),
      rent: i === periods ? rent : round2(pmt),
      principal: principalPayment,
      interest,
      remainingPrincipal: remaining,
    })
  }

  return schedule
}

/**
 * 等额本金计算
 * 每期本金 = P / n
 * 每期利息 = 剩余本金 * 月利率
 */
function calcEqualPrincipal(principal: number, monthlyRate: number, periods: number, residualValue: number): ScheduleItem[] {
  const schedule: ScheduleItem[] = []
  const startDate = dayjs()
  const principalPerPeriod = round2(principal / periods)
  let remaining = principal

  for (let i = 1; i <= periods; i++) {
    const interest = round2(remaining * monthlyRate)
    // 最后一期处理尾差
    const actualPrincipal = i === periods ? round2(remaining) : principalPerPeriod
    let rent = round2(actualPrincipal + interest)

    // 最后一期加上留购价
    if (i === periods) {
      rent = round2(rent + residualValue)
    }

    remaining = round2(remaining - actualPrincipal)
    if (remaining < 0) remaining = 0

    schedule.push({
      period: i,
      date: startDate.add(i, 'month').format('YYYY-MM-DD'),
      rent,
      principal: actualPrincipal,
      interest,
      remainingPrincipal: remaining,
    })
  }

  return schedule
}

/**
 * 先息后本计算
 * 前 n-1 期只付利息，最后一期还本金 + 利息 + 留购价
 */
function calcInterestFirst(principal: number, monthlyRate: number, periods: number, residualValue: number): ScheduleItem[] {
  const schedule: ScheduleItem[] = []
  const startDate = dayjs()
  const interest = round2(principal * monthlyRate)

  for (let i = 1; i <= periods; i++) {
    if (i < periods) {
      // 前 n-1 期：只付利息
      schedule.push({
        period: i,
        date: startDate.add(i, 'month').format('YYYY-MM-DD'),
        rent: interest,
        principal: 0,
        interest,
        remainingPrincipal: principal,
      })
    } else {
      // 最后一期：还本金 + 利息 + 留购价
      schedule.push({
        period: i,
        date: startDate.add(i, 'month').format('YYYY-MM-DD'),
        rent: round2(principal + interest + residualValue),
        principal,
        interest,
        remainingPrincipal: 0,
      })
    }
  }

  return schedule
}

/**
 * 使用牛顿迭代法计算 IRR（内部收益率）
 * 
 * IRR 是使得 NPV = 0 的折现率
 * NPV = -C0 + C1/(1+r) + C2/(1+r)^2 + ... + Cn/(1+r)^n = 0
 * 
 * @param cashflows 现金流数组，cashflows[0] 为初始投资（负数），后续为每期收入
 * @param guess 初始猜测值（月利率）
 * @returns 月 IRR
 */
function calcIRR(cashflows: number[], guess: number = 0.01): number {
  const maxIterations = 1000
  const tolerance = 1e-10
  let rate = guess

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0
    let dnpv = 0 // NPV 对 rate 的导数

    for (let j = 0; j < cashflows.length; j++) {
      const factor = Math.pow(1 + rate, j)
      npv += cashflows[j] / factor
      if (j > 0) {
        dnpv -= j * cashflows[j] / Math.pow(1 + rate, j + 1)
      }
    }

    // 如果 NPV 已经足够接近 0，停止迭代
    if (Math.abs(npv) < tolerance) {
      break
    }

    // 防止除以零
    if (Math.abs(dnpv) < 1e-20) {
      break
    }

    // 牛顿迭代：rate_new = rate - f(rate) / f'(rate)
    rate = rate - npv / dnpv
  }

  return rate
}

/**
 * 计算租赁方案
 * 
 * @param params 租赁参数
 * @returns 计算结果（还款计划、总租金、总利息、IRR）
 */
export function calculateLease(params: LeaseParams): CalculationResult {
  const {
    financingAmount,
    leaseTerm,
    annualRate,
    repaymentMethod,
    downPaymentRatio = 0,
    depositRatio = 0,
    residualValue = 0,
  } = params

  // 计算实际融资本金（扣除首付）
  const downPayment = financingAmount * (downPaymentRatio / 100)
  const deposit = financingAmount * (depositRatio / 100)
  const actualPrincipal = financingAmount - downPayment

  // 月利率 = 年利率 / 12
  const monthlyRate = annualRate / 100 / 12

  // 根据还款方式计算还款计划
  let schedule: ScheduleItem[]

  switch (repaymentMethod) {
    case 'equal_payment':
      schedule = calcEqualPayment(actualPrincipal, monthlyRate, leaseTerm, residualValue)
      break
    case 'equal_principal':
      schedule = calcEqualPrincipal(actualPrincipal, monthlyRate, leaseTerm, residualValue)
      break
    case 'interest_first':
      schedule = calcInterestFirst(actualPrincipal, monthlyRate, leaseTerm, residualValue)
      break
    default:
      schedule = calcEqualPayment(actualPrincipal, monthlyRate, leaseTerm, residualValue)
  }

  // 计算汇总数据
  const totalRent = round2(schedule.reduce((sum, item) => sum + item.rent, 0))
  const totalInterest = round2(schedule.reduce((sum, item) => sum + item.interest, 0))

  // 计算 IRR
  // 现金流：第0期为融资放款（负数），之后每期为租金收入（正数）
  // 如果有首付，从承租人视角，第0期为 -融资金额+首付+保证金 = -(actualPrincipal - deposit)
  // 最后还需考虑保证金退还
  const cashflows: number[] = [-(actualPrincipal - deposit)]
  for (let i = 0; i < schedule.length; i++) {
    let cf = schedule[i].rent
    // 最后一期退还保证金
    if (i === schedule.length - 1 && deposit > 0) {
      cf = cf - deposit
    }
    cashflows.push(cf)
  }

  // 计算月 IRR，然后年化 (月IRR * 12)
  const monthlyIRR = calcIRR(cashflows, monthlyRate || 0.01)
  const annualIRR = round2(monthlyIRR * 12 * 100) // 转为百分比

  return {
    schedule,
    totalRent,
    totalInterest,
    irr: annualIRR,
  }
}

/**
 * 格式化金额（千分位 + 2位小数）
 */
export function formatAmount(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%'
  return value.toFixed(2) + '%'
}
