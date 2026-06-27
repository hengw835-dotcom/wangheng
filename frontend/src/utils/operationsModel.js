import { MACHINE_STATUSES, TASK_STATUSES } from '../services/api-contracts.js'

export const ALL_STATUS = 'ALL'

const TASK_TRANSITIONS = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: []
}

function includesKeyword(values, keyword) {
  const text = String(keyword || '').trim().toLowerCase()
  if (!text) return true
  return values.some(value => String(value || '').toLowerCase().includes(text))
}

export function paginateRows(rows = [], { page = 1, pageSize = 10 } = {}) {
  const currentPage = Math.max(1, Number(page) || 1)
  const size = Math.max(1, Number(pageSize) || 10)
  const start = (currentPage - 1) * size
  return rows.slice(start, start + size)
}

export function filterMachines(machines = [], filters = {}) {
  const status = filters.status || ALL_STATUS
  return machines.filter(machine => {
    const matchesStatus = status === ALL_STATUS || machine.status === status
    const matchesKeyword = includesKeyword([machine.machineId, machine.model, machine.location], filters.keyword)
    return matchesStatus && matchesKeyword
  })
}

export function filterTasks(tasks = [], filters = {}) {
  const status = filters.status || ALL_STATUS
  return tasks.filter(task => {
    const matchesStatus = status === ALL_STATUS || (TASK_STATUSES.includes(status) && task.status === status)
    const matchesMachine = !filters.machineId || filters.machineId === ALL_STATUS || task.machineId === filters.machineId
    const matchesKeyword = includesKeyword([task.taskId, task.machineId, task.fieldName], filters.keyword)
    return matchesStatus && matchesMachine && matchesKeyword
  })
}

export function canTransitionTaskStatus(fromStatus, toStatus) {
  return (TASK_TRANSITIONS[fromStatus] || []).includes(toStatus)
}

export function validateMachineForm(form = {}) {
  const errors = {}
  if (!String(form.machineId || '').trim()) errors.machineId = '农机编号不能为空'
  if (!String(form.model || '').trim()) errors.model = '型号不能为空'
  if (form.status && !MACHINE_STATUSES.includes(form.status)) errors.status = '设备状态不合法'
  return errors
}

export function validateTaskForm(form = {}) {
  const errors = {}
  if (!String(form.fieldName || '').trim()) errors.fieldName = '地块名称不能为空'
  if (!String(form.machineId || '').trim()) errors.machineId = '农机编号不能为空'
  if (Number(form.targetArea || 0) <= 0) errors.targetArea = '目标面积必须大于 0'
  return errors
}

export function mapServerFieldErrors(error) {
  const data = error?.response?.data || {}
  if (data.fieldErrors && typeof data.fieldErrors === 'object') return data.fieldErrors
  const message = data.message || data.error || ''
  if (/machine/i.test(message)) return { machineId: message }
  if (/task/i.test(message)) return { taskId: message }
  if (/area/i.test(message)) return { targetArea: message }
  return {}
}

export function hasErrors(errors = {}) {
  return Object.keys(errors).length > 0
}
