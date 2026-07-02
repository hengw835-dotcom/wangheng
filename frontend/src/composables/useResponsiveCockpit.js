import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function getCockpitBreakpoint(width = 1366) {
  if (width >= 1920) return 'xl'
  if (width >= 1600) return 'lg'
  if (width >= 1440) return 'md'
  return 'sm'
}

export function getCockpitLayoutMetrics(width = 1366, height = 768) {
  const breakpoint = getCockpitBreakpoint(width)
  const table = {
    xl: { leftWidth: 360, rightWidth: 380, bottomHeight: 210, compact: false },
    lg: { leftWidth: 320, rightWidth: 340, bottomHeight: 210, compact: false },
    md: { leftWidth: 300, rightWidth: 320, bottomHeight: 200, compact: false },
    sm: { leftWidth: 280, rightWidth: 300, bottomHeight: 180, compact: true }
  }
  const metrics = table[breakpoint]
  return {
    breakpoint,
    headerHeight: 56,
    leftWidth: metrics.leftWidth,
    rightWidth: metrics.rightWidth,
    bottomHeight: Math.max(height < 760 ? 160 : metrics.bottomHeight, 160),
    compact: metrics.compact,
    centerMinRatio: 0.45
  }
}

export function useResponsiveCockpit() {
  const width = ref(typeof window === 'undefined' ? 1366 : window.innerWidth)
  const height = ref(typeof window === 'undefined' ? 768 : window.innerHeight)

  function updateViewport(nextWidth, nextHeight) {
    width.value = nextWidth ?? (typeof window === 'undefined' ? width.value : window.innerWidth)
    height.value = nextHeight ?? (typeof window === 'undefined' ? height.value : window.innerHeight)
  }

  if (typeof window !== 'undefined') {
    onMounted(() => {
      updateViewport()
      window.addEventListener('resize', updateViewport)
    })
    onBeforeUnmount(() => window.removeEventListener('resize', updateViewport))
  }

  const metrics = computed(() => getCockpitLayoutMetrics(width.value, height.value))
  return { width, height, metrics, updateViewport }
}
