import { CONTROL_COMMANDS } from '../services/api-contracts.js'

export const COMMAND_STATES = {
  READY: '待确认',
  SENDING: '发送中',
  ACCEPTED: '已受理',
  SUCCEEDED: '执行成功',
  FAILED: '执行失败',
  TIMEOUT: '超时'
}

const COMMAND_ALLOWED_STATUSES = {
  START: ['ONLINE', 'IDLE', 'STOPPED', 'PAUSED'],
  PAUSE: ['WORKING'],
  RESUME: ['PAUSED'],
  STOP: ['WORKING', 'PAUSED', 'IDLE'],
  APPLY_PARAMS: ['ONLINE', 'IDLE', 'WORKING', 'PAUSED']
}

export function canSendControlCommand(command, machineStatus) {
  if (!CONTROL_COMMANDS.includes(command)) return false
  return (COMMAND_ALLOWED_STATUSES[command] || []).includes(machineStatus)
}

export function commandStateFromAudit(audit = {}) {
  if (audit.status === 'ACKNOWLEDGED') return COMMAND_STATES.SUCCEEDED
  if (['FAILED', 'REJECTED'].includes(audit.status)) return COMMAND_STATES.FAILED
  if (['PENDING', 'PUBLISHED'].includes(audit.status)) return COMMAND_STATES.ACCEPTED
  return COMMAND_STATES.READY
}

export function validateControlParameters(params = {}) {
  const errors = {}
  const targetSpeed = Number(params.targetSpeed)
  const cuttingHeight = Number(params.cuttingHeight)
  const feedingRate = Number(params.feedingRate)
  if (Number.isNaN(targetSpeed) || targetSpeed < 0 || targetSpeed > 20) errors.targetSpeed = '目标速度必须在 0-20 km/h'
  if (Number.isNaN(cuttingHeight) || cuttingHeight < 0 || cuttingHeight > 100) errors.cuttingHeight = '割台高度必须在 0-100 cm'
  if (Number.isNaN(feedingRate) || feedingRate < 0 || feedingRate > 100) errors.feedingRate = '喂入量必须在 0-100%'
  return errors
}

export function nextReconnectDelay(attempt, baseMs = 1000, maxMs = 30000, jitterRatio = Math.random() * 0.25) {
  const exponential = Math.min(maxMs, baseMs * (2 ** Math.max(0, attempt)))
  return Math.min(maxMs, Math.round(exponential * (1 + jitterRatio)))
}

export function hasControlErrors(errors = {}) {
  return Object.keys(errors).length > 0
}

export function createSubscriptionRegistry() {
  const topics = new Map()
  return {
    add(topic, handler) {
      if (!topics.has(topic)) topics.set(topic, new Set())
      const handlers = topics.get(topic)
      const before = handlers.size
      handlers.add(handler)
      return handlers.size > before
    },
    remove(topic, handler) {
      const handlers = topics.get(topic)
      if (!handlers) return false
      const removed = handlers.delete(handler)
      if (handlers.size === 0) topics.delete(topic)
      return removed
    },
    list(topic) {
      return Array.from(topics.get(topic) || [])
    },
    clear() {
      topics.clear()
    },
    size(topic) {
      if (topic) return topics.get(topic)?.size || 0
      return Array.from(topics.values()).reduce((total, handlers) => total + handlers.size, 0)
    }
  }
}
