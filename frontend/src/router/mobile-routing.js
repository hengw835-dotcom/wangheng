export function resolveDefaultRouteForViewport(width = globalThis.innerWidth) {
  return Number(width) <= 768 ? '/mobile' : '/'
}

export function isMobileViewport(width = globalThis.innerWidth) {
  return resolveDefaultRouteForViewport(width) === '/mobile'
}
