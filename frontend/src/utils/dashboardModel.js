const ONLINE_STATUSES = new Set(['ONLINE', 'WORKING', 'IDLE'])
const ACTIVE_TASK_STATUSES = new Set(['IN_PROGRESS', 'RUNNING'])

export function taskProgress(task) {
  const target = Number(task?.targetArea || 0)
  const completed = Number(task?.completedArea || 0)
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((completed / target) * 100)))
}

export function calculateFleetSummary(machines = [], tasks = []) {
  const totalTarget = tasks.reduce((sum, task) => sum + Number(task.targetArea || 0), 0)
  const totalCompleted = tasks.reduce((sum, task) => sum + Number(task.completedArea || 0), 0)

  return {
    onlineMachines: machines.filter(machine => ONLINE_STATUSES.has(machine.status)).length,
    totalMachines: machines.length,
    activeTasks: tasks.filter(task => task.status === 'IN_PROGRESS').length,
    totalTasks: tasks.length,
    harvestProgress: totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  }
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function percentValue(part, total, digits = 1) {
  if (!total) return 0
  return Number(((part / total) * 100).toFixed(digits))
}

function machineHealth(machine) {
  const status = machine?.status
  if (status === 'WORKING') return 95
  if (status === 'ONLINE' || status === 'IDLE') return 88
  if (status === 'MAINTENANCE') return 72
  if (status === 'ERROR') return 48
  return 35
}

function machineType(machine) {
  const model = machine?.model || ''
  if (/tractor|拖拉/i.test(model)) return '拖拉机'
  if (/spray|植保/i.test(model)) return '植保机'
  if (/seed|播/i.test(model)) return '播种机'
  return '收割机'
}

function machineId(machine, index = 0) {
  return machine?.machineId || machine?.id || `M-${index + 1}`
}

function taskArea(tasks = [], key = 'completedArea') {
  return tasks.reduce((sum, task) => sum + Number(task?.[key] || 0), 0)
}

function buildTrendSeries(tasks = [], key = 'completedArea') {
  const total = taskArea(tasks, key)
  const steps = [0.08, 0.28, 0.48, 0.68, 0.82, 0.93, 1]
  return steps.map(step => Math.round(total * step))
}

function stablePosition(id, index) {
  const text = String(id || index)
  const seed = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return {
    x: 18 + ((seed * 17) % 64),
    y: 18 + ((seed * 23) % 58)
  }
}

function buildFields(tasks = []) {
  const fields = new Map()
  tasks.forEach((task, index) => {
    const name = task?.fieldName || `地块-${index + 1}`
    const area = Number(task?.targetArea || 0)
    fields.set(name, {
      id: name,
      area,
      progress: taskProgress(task)
    })
  })
  return [...fields.values()]
}

function buildAlarms(machines = []) {
  return machines
    .filter(machine => ['ERROR', 'MAINTENANCE', 'OFFLINE'].includes(machine?.status))
    .map((machine, index) => ({
      time: formatTime(machine?.lastUpdated),
      device: machineId(machine, index),
      type: machine.status === 'OFFLINE' ? '设备离线' : machine.status === 'MAINTENANCE' ? '维护状态' : '设备异常',
      level: machine.status === 'ERROR' ? 'danger' : 'warning',
      levelText: machine.status === 'ERROR' ? '严重' : '重要',
      status: 'todo',
      statusText: '未处理'
    }))
}

function buildEvents(machines = [], tasks = []) {
  const machineEvents = machines.map((machine, index) => ({
    time: machine?.lastUpdated || '',
    device: machineId(machine, index),
    type: '位置更新',
    content: `${machineId(machine, index)} 状态为 ${statusLabel(machine?.status)}，位置 ${machine?.location || '未知'}`,
    status: machine?.status === 'ERROR' ? 'danger' : 'success',
    statusText: machine?.status === 'ERROR' ? '告警' : '成功',
    tone: machine?.status === 'ERROR' ? 'red-text' : 'green-text'
  }))
  const taskEvents = tasks.map((task, index) => ({
    time: task?.startTime || '',
    device: task?.machineId || `TASK-${index + 1}`,
    type: '任务更新',
    content: `${task?.fieldName || '未命名地块'} ${statusLabel(task?.status)}，完成面积 ${Number(task?.completedArea || 0)} 亩`,
    status: task?.status === 'COMPLETED' ? 'success' : 'pending',
    statusText: task?.status === 'COMPLETED' ? '成功' : '进行中',
    tone: 'green-text'
  }))

  return [...machineEvents, ...taskEvents]
    .sort((a, b) => String(b.time).localeCompare(String(a.time)))
    .slice(0, 6)
    .map(event => ({ ...event, time: formatTime(event.time) }))
}

function formatTime(value) {
  if (!value) return '--:--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(11, 19) || String(value)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

export function buildDashboardSnapshot({ machines = [], tasks = [], capabilities = {}, now = new Date() } = {}) {
  const summary = calculateFleetSummary(machines, tasks)
  const completedArea = taskArea(tasks, 'completedArea')
  const targetArea = taskArea(tasks, 'targetArea')
  const onlineRate = percentValue(summary.onlineMachines, summary.totalMachines)
  const progress = targetArea > 0 ? percentValue(completedArea, targetArea) : 0
  const running = tasks.filter(task => ACTIVE_TASK_STATUSES.has(task.status)).length
  const completed = tasks.filter(task => task.status === 'COMPLETED').length
  const pending = tasks.filter(task => task.status === 'PENDING').length
  const alarms = buildAlarms(machines)
  const events = buildEvents(machines, tasks)

  const topMachines = machines
    .map((machine, index) => {
      const id = machineId(machine, index)
      return {
        id,
        type: machineType(machine),
        model: machine?.model || '--',
        status: machine?.status || 'UNKNOWN',
        statusText: statusLabel(machine?.status),
        location: machine?.location || '--',
        rate: machineHealth(machine),
        health: machineHealth(machine),
        updatedAt: formatTime(machine?.lastUpdated),
        ...stablePosition(id, index)
      }
    })
    .sort((a, b) => b.health - a.health)
    .slice(0, 5)

  return {
    lastUpdated: now.toLocaleString('zh-CN', { hour12: false }),
    summary,
    kpis: [
      { title: '设备在线统计', value: formatNumber(summary.onlineMachines), unit: `/ ${summary.totalMachines} 台`, sub: `在线率 ${formatPercent(onlineRate)}`, trend: '+0.0%', icon: 'Connection', visual: 'spark' },
      { title: '作业任务统计', value: formatNumber(running), unit: `/ ${summary.totalTasks} 个`, sub: `进行中 ${running} 个`, trend: '+0.0%', icon: 'Tickets', visual: 'spark' },
      { title: '收割进度', value: formatNumber(progress, 1), unit: '%', sub: `已完成 ${formatNumber(completedArea)} 亩`, trend: '+0.0%', icon: 'Grid', visual: 'ring' },
      { title: '今日作业时长', value: formatNumber(running * 2.4, 1), unit: 'h', sub: `任务 ${summary.totalTasks} 个`, trend: '+0.0%', icon: 'Clock', visual: 'bars green' },
      { title: '今日油耗', value: formatNumber(completedArea * 0.68, 1), unit: 'L', sub: `面积 ${formatNumber(completedArea)} 亩`, trend: '+0.0%', icon: 'Van', visual: 'bars yellow' },
      { title: 'AI识别置信度', value: capabilities.aiVision === 'enabled' ? '92.0' : '0.0', unit: '%', sub: `能力 ${capabilities.aiVision || 'unknown'}`, trend: '+0.0%', icon: 'Cpu', visual: 'line-mini' }
    ],
    taskProgress: {
      pending,
      running,
      completed,
      total: summary.totalTasks,
      completedRate: percentValue(completed, summary.totalTasks)
    },
    topMachines,
    alarms,
    events,
    fields: buildFields(tasks),
    trends: {
      areaToday: buildTrendSeries(tasks, 'completedArea'),
      areaYesterday: buildTrendSeries(tasks, 'targetArea').map(value => Math.round(value * 0.72)),
      fuelToday: buildTrendSeries(tasks, 'completedArea').map(value => Math.round(value * 0.68)),
      fuelYesterday: buildTrendSeries(tasks, 'completedArea').map(value => Math.round(value * 0.54))
    },
    ai: {
      statusText: capabilities.aiVision || 'unknown',
      detectionType: capabilities.aiVision === 'enabled' ? '实时识别' : '暂无识别流',
      confidence: capabilities.aiVision === 'enabled' ? 0.92 : 0
    }
  }
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

export function statusLabel(status) {
  const labels = {
    ONLINE: '在线',
    OFFLINE: '离线',
    WORKING: '作业中',
    IDLE: '待命',
    MAINTENANCE: '维护中',
    ERROR: '告警',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    PENDING: '待开始'
  }
  return labels[status] || status || '未知'
}
