export const MACHINE_STATUSES = [
  'ONLINE',
  'OFFLINE',
  'WORKING',
  'IDLE',
  'MAINTENANCE',
  'ERROR',
  'PAUSED',
  'STOPPED'
]

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
export const CONTROL_COMMANDS = ['START', 'PAUSE', 'RESUME', 'STOP', 'APPLY_PARAMS']

export function createTextBodyConfig(extraConfig = {}) {
  return {
    ...extraConfig,
    headers: {
      ...(extraConfig.headers || {}),
      'Content-Type': 'text/plain'
    }
  }
}

export function buildTaskProgressParams(completedArea) {
  return { params: { completedArea } }
}

export function createIdempotencyKey(machineId, command) {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${machineId}-${command}-${suffix}`
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map(item => String(item)) : []
}

export function toAuthSessionDto(data = {}) {
  return {
    accessToken: data.accessToken || '',
    tokenType: data.tokenType || 'Bearer',
    expiresAt: data.expiresAt || '',
    roles: normalizeStringArray(data.roles)
  }
}

export function toMachineDto(data = {}) {
  return {
    id: data.id,
    machineId: data.machineId,
    model: data.model,
    status: data.status,
    location: data.location,
    lastUpdated: data.lastUpdated,
    parameters: data.parameters || {}
  }
}

export function toTaskDto(data = {}) {
  return {
    id: data.id,
    taskId: data.taskId,
    machineId: data.machineId,
    fieldName: data.fieldName,
    startTime: data.startTime,
    endTime: data.endTime,
    status: data.status,
    targetArea: data.targetArea,
    completedArea: data.completedArea,
    estimatedYield: data.estimatedYield
  }
}

export function toSensorDataDto(data = {}) {
  return {
    id: data.id,
    machineId: data.machineId,
    sensorType: data.sensorType,
    value: data.value,
    unit: data.unit,
    timestamp: data.timestamp,
    location: data.location
  }
}

export function toCapabilitiesDto(data = {}) {
  return {
    aiVision: data.aiVision || 'unknown',
    navigation: data.navigation || 'unknown',
    control: data.control || 'unknown'
  }
}
