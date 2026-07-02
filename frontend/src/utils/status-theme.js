export const COCKPIT_STATUS_TYPES = ['success', 'warning', 'danger', 'info', 'offline', 'stale']

const STATUS_ALIASES = {
  ONLINE: 'success',
  NORMAL: 'success',
  SUCCESS: 'success',
  COMPLETED: 'success',
  RUNNING: 'warning',
  IN_PROGRESS: 'warning',
  PENDING: 'warning',
  WARNING: 'warning',
  ALARM: 'danger',
  ERROR: 'danger',
  DANGER: 'danger',
  FAULT: 'danger',
  OFFLINE: 'offline',
  DISCONNECTED: 'offline',
  STALE: 'stale',
  EXPIRED: 'stale',
  TIMEOUT: 'stale',
  INFO: 'info',
  UNKNOWN: 'info'
}

const STATUS_LABELS = {
  success: '在线',
  warning: '预警',
  danger: '告警',
  info: '信息',
  offline: '离线',
  stale: '过期'
}

export function normalizeCockpitStatus(status = '') {
  const normalized = String(status || '').trim().toUpperCase()
  return STATUS_ALIASES[normalized] || 'info'
}

export function getCockpitStatusMeta(status = '') {
  const type = normalizeCockpitStatus(status)
  return {
    type,
    label: STATUS_LABELS[type],
    className: `yh-status-badge yh-status-badge--${type}`
  }
}
