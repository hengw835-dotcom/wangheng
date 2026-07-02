import { computed, ref, watch } from 'vue'

export const COCKPIT_DRAWER_TYPES = ['machine', 'task', 'sensor', 'control', 'report']
const DRAWER_QUERY_KEYS = ['drawer', 'machineId', 'taskId', 'sensorId', 'reportId']

function assertDrawerType(type) {
  if (!COCKPIT_DRAWER_TYPES.includes(type)) throw new Error(`Unsupported cockpit drawer: ${type}`)
}

export function clearDrawerQuery(baseQuery = {}) {
  const next = { ...baseQuery }
  for (const key of DRAWER_QUERY_KEYS) delete next[key]
  return next
}

export function buildDrawerQuery(type, params = {}, baseQuery = {}) {
  assertDrawerType(type)
  return {
    ...clearDrawerQuery(baseQuery),
    drawer: type,
    ...params
  }
}

export function useDrawerManager(router, route) {
  const currentDrawer = ref(route?.query?.drawer || null)
  const drawerParams = ref(clearDrawerQuery(route?.query || {}))

  if (route) {
    watch(
      () => route.query,
      query => {
        currentDrawer.value = query.drawer || null
        drawerParams.value = clearDrawerQuery(query || {})
      },
      { immediate: true }
    )
  }

  const isDrawerOpen = computed(() => Boolean(currentDrawer.value))

  async function openDrawer(type, params = {}, options = {}) {
    const query = buildDrawerQuery(type, params, route?.query || {})
    currentDrawer.value = type
    drawerParams.value = params
    if (router && options.syncRoute !== false) await router.replace({ query })
  }

  async function closeDrawer(options = {}) {
    currentDrawer.value = null
    drawerParams.value = {}
    if (router && options.syncRoute !== false) await router.replace({ query: clearDrawerQuery(route?.query || {}) })
  }

  return { currentDrawer, drawerParams, isDrawerOpen, openDrawer, closeDrawer }
}
