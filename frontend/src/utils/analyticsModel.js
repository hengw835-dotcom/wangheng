export const IMAGE_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export function validateAiImage(file, maxSize = MAX_IMAGE_SIZE) {
  if (!file) return '请选择图片'
  if (!IMAGE_ACCEPT_TYPES.includes(file.type)) return '仅支持 JPG、PNG、WebP 图片'
  if (file.size > maxSize) return `图片不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`
  return ''
}

export function normalizeDetectionBox(result = {}, imageSize = {}) {
  const width = Number(imageSize.width || 1)
  const height = Number(imageSize.height || 1)
  const x = Math.max(0, Number(result.x || 0))
  const y = Math.max(0, Number(result.y || 0))
  const boxWidth = Math.max(0, Number(result.width || 0))
  const boxHeight = Math.max(0, Number(result.height || 0))
  return {
    left: Math.min(100, (x / width) * 100),
    top: Math.min(100, (y / height) * 100),
    width: Math.min(100, (boxWidth / width) * 100),
    height: Math.min(100, (boxHeight / height) * 100)
  }
}

export function filterSensorRecords(records = [], filters = {}) {
  const start = filters.start ? new Date(filters.start).getTime() : null
  const end = filters.end ? new Date(filters.end).getTime() : null
  return records
    .filter(record => !filters.machineId || record.machineId === filters.machineId)
    .filter(record => !filters.sensorType || record.sensorType === filters.sensorType)
    .filter(record => {
      const time = record.timestamp ? new Date(record.timestamp).getTime() : 0
      if (start && time < start) return false
      if (end && time > end) return false
      return true
    })
}

export function sortSensorRecords(records = [], direction = 'desc') {
  const factor = direction === 'asc' ? 1 : -1
  return [...records].sort((a, b) => (new Date(a.timestamp || 0) - new Date(b.timestamp || 0)) * factor)
}

export function paginateRecords(records = [], page = 1, pageSize = 20) {
  const total = records.length
  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.max(1, Number(pageSize) || 20)
  const start = (safePage - 1) * safeSize
  return {
    total,
    page: safePage,
    pageSize: safeSize,
    rows: records.slice(start, start + safeSize)
  }
}

export function validateMachineId(machineId) {
  if (!machineId) return '请输入设备编号'
  if (!/^[A-Za-z0-9_-]+$/.test(machineId)) return '设备编号只能包含字母、数字、下划线和连字符'
  if (machineId.length > 64) return '设备编号不能超过 64 个字符'
  return ''
}

export function validateSimulatorReading(reading = {}) {
  const errors = {}
  const machineIdError = validateMachineId(reading.machineId)
  if (machineIdError) errors.machineId = machineIdError
  if (!reading.sensorType || !/^[A-Za-z0-9_-]+$/.test(reading.sensorType)) errors.sensorType = '传感器类型只能包含字母、数字、下划线和连字符'
  if (reading.sensorType && reading.sensorType.length > 50) errors.sensorType = '传感器类型不能超过 50 个字符'
  if (reading.value === '' || reading.value === null || Number.isNaN(Number(reading.value))) errors.value = '数值必须是数字'
  if (String(reading.unit || '').length > 20) errors.unit = '单位不能超过 20 个字符'
  if (String(reading.location || '').length > 255) errors.location = '位置不能超过 255 个字符'
  return errors
}

export function buildReportRows({ machines = [], tasks = [], sensorSummary = {} } = {}, labels = {}) {
  const statusLabel = labels.statusLabel || (status => status || '')
  const machineStatusLabel = labels.machineStatusLabel || (status => status || '')
  return [
    ['类型', '编号', '名称/地块', '状态', '面积', '产量', '备注'],
    ...tasks.map(task => ['任务', task.taskId, task.fieldName, statusLabel(task.status), task.completedArea || 0, task.estimatedYield || 0, '真实任务接口聚合']),
    ...machines.map(machine => ['设备', machine.machineId, machine.model, machineStatusLabel(machine.status), '', '', '真实设备接口聚合']),
    ['传感器', '', sensorSummary.latestMachine || '', '', '', '', `记录 ${sensorSummary.total || 0} 条，前端可替换聚合适配层`]
  ]
}

export function toCsv(rows = []) {
  return rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
}

export function summarizeSensors(recordsByMachine = {}) {
  let total = 0
  let latestMachine = ''
  let latestTime = ''
  Object.entries(recordsByMachine).forEach(([machineId, records]) => {
    total += records.length
    records.forEach(record => {
      if (record.timestamp && (!latestTime || new Date(record.timestamp) > new Date(latestTime))) {
        latestTime = record.timestamp
        latestMachine = machineId
      }
    })
  })
  return { total, machineCount: Object.keys(recordsByMachine).length, latestMachine, latestTime }
}
