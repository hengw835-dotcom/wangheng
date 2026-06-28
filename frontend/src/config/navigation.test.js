import assert from 'node:assert/strict'
import test from 'node:test'

import { navItems } from './navigation.js'

test('keeps every primary page reachable from global navigation', () => {
  assert.deepEqual(navItems.map(item => item.path), [
    '/',
    '/machines',
    '/tasks',
    '/monitor',
    '/vision',
    '/sensors',
    '/simulator',
    '/reports',
    '/integrated',
    '/home'
  ])
})

test('uses readable Chinese labels for primary navigation', () => {
  assert.deepEqual(navItems.map(item => item.label), [
    '总览',
    '设备',
    '任务',
    '控制',
    'AI视觉',
    '传感器',
    '模拟器',
    '报表',
    '综合大屏',
    '旧首页'
  ])
})
