import assert from 'node:assert/strict'
import test from 'node:test'

import { getCockpitBreakpoint, getCockpitLayoutMetrics } from './useResponsiveCockpit.js'

test('maps viewport widths to cockpit breakpoints', () => {
  assert.equal(getCockpitBreakpoint(1920), 'xl')
  assert.equal(getCockpitBreakpoint(1600), 'lg')
  assert.equal(getCockpitBreakpoint(1440), 'md')
  assert.equal(getCockpitBreakpoint(1366), 'sm')
})

test('calculates layout metrics with readable minimum panel sizes', () => {
  assert.deepEqual(getCockpitLayoutMetrics(1920, 1080), {
    breakpoint: 'xl',
    headerHeight: 56,
    leftWidth: 360,
    rightWidth: 380,
    bottomHeight: 210,
    compact: false,
    centerMinRatio: 0.45
  })
  assert.equal(getCockpitLayoutMetrics(1600, 900).leftWidth, 320)
  assert.equal(getCockpitLayoutMetrics(1440, 900).rightWidth, 320)
  assert.equal(getCockpitLayoutMetrics(1366, 768).bottomHeight, 180)
  assert.equal(getCockpitLayoutMetrics(1366, 768).compact, true)
})
