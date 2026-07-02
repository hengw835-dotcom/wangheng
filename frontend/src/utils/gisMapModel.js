const DEFAULT_MAP_LAYER = 'standard'
const MAP_LAYERS = ['standard', 'terrain', 'satellite']
const MIN_ZOOM = 13
const MAX_ZOOM = 20

function formatTime(value = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(value)
}

function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

export function buildDeviceOptions(machines = []) {
  return [
    { label: '全部设备', value: 'ALL' },
    ...machines.map(machine => ({
      label: machine.id || machine.machineId || machine.name || '未知设备',
      value: machine.id || machine.machineId || machine.name || ''
    }))
  ]
}

export function filterMapMachines(machines = [], { selectedDevice = 'ALL', keyword = '' } = {}) {
  const normalizedKeyword = String(keyword).trim().toLowerCase()

  return machines.filter(machine => {
    const id = machine.id || machine.machineId || ''
    const matchesDevice = selectedDevice === 'ALL' || id === selectedDevice
    const searchable = [id, machine.name, machine.type, machine.location, machine.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const matchesKeyword = !normalizedKeyword || searchable.includes(normalizedKeyword)
    return matchesDevice && matchesKeyword
  })
}

export function buildGisMapState(now = new Date()) {
  return {
    zoom: 13,
    mapLayer: DEFAULT_MAP_LAYER,
    measuring: false,
    lastRefreshed: formatTime(now)
  }
}

export function zoomGisMap(state, delta) {
  return {
    ...state,
    zoom: clampZoom((state?.zoom ?? 13) + delta)
  }
}

export function cycleMapLayer(state = {}) {
  const currentIndex = MAP_LAYERS.indexOf(state.mapLayer)
  const nextLayer = MAP_LAYERS[(currentIndex + 1) % MAP_LAYERS.length]
  return {
    ...state,
    mapLayer: nextLayer
  }
}

export function formatRouteDistance(meters = 0) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.max(0, Math.round(meters))} m`
}

export function refreshGisMapState(state, now = new Date()) {
  return {
    ...state,
    lastRefreshed: formatTime(now)
  }
}
