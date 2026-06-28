<template>
  <header class="top-nav">
    <button class="brand" type="button" @click="router.push('/')">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-copy">
        <strong>智能农机系统</strong>
        <small>Smart Harvester Operations</small>
      </span>
    </button>

    <nav class="page-nav" aria-label="页面导航">
      <button
        v-for="item in navItems"
        :key="item.path"
        type="button"
        :class="{ active: isActive(item.path) }"
        @click="router.push(item.path)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="nav-tools">
      <span class="system-pill"><i></i>运行正常</span>
      <button class="user-btn" type="button" title="退出登录" @click="authStore.logout()">
        <span class="avatar"></span>
        <strong>{{ displayName }}</strong>
      </button>
      <time>{{ fullTime }}</time>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Cpu,
  DataAnalysis,
  HomeFilled,
  Monitor,
  Platform,
  Position,
  Tickets,
  Van,
  VideoCamera,
  View
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const now = ref(new Date())
let timer

const navItems = [
  { label: '总览', path: '/', icon: HomeFilled },
  { label: '设备', path: '/machines', icon: Platform },
  { label: '任务', path: '/tasks', icon: Tickets },
  { label: '控制', path: '/monitor', icon: Cpu },
  { label: 'AI', path: '/vision', icon: VideoCamera },
  { label: '传感', path: '/sensors', icon: Position },
  { label: '模拟', path: '/simulator', icon: Monitor },
  { label: '报表', path: '/reports', icon: DataAnalysis },
  { label: '综合', path: '/integrated', icon: View },
  { label: '旧首页', path: '/home', icon: Van }
]

const displayName = computed(() => authStore.username || '管理员')
const fullTime = computed(() => now.value.toLocaleString('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).replace(/\//g, '-'))

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.top-nav {
  height: 64px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
  color: #dbeafe;
  background: linear-gradient(180deg, #071525 0%, #03101d 100%);
  border-bottom: 1px solid rgba(105, 136, 170, 0.26);
}

button {
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  text-align: left;
}

.brand-mark {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 10px;
  background:
    radial-gradient(circle at 34% 32%, #7cf5a2 0 18%, transparent 19%),
    conic-gradient(from 210deg, #32d583, #2dd4bf, #47a3ff, #32d583);
  box-shadow: 0 0 24px rgba(45, 212, 191, 0.26);
}

.brand-copy {
  min-width: 0;
}

.brand-copy strong {
  display: block;
  overflow: hidden;
  color: #f8fbff;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-copy small {
  display: block;
  overflow: hidden;
  color: #8ea8c3;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.page-nav button {
  height: 36px;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid rgba(80, 111, 135, .28);
  border-radius: 6px;
  color: #b9cce3;
  background: rgba(12, 28, 42, .55);
  font-size: 14px;
}

.page-nav button.active {
  color: #1ff0b5;
  border-color: rgba(31, 240, 181, .42);
  background: rgba(31, 240, 181, .13);
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.system-pill,
.user-btn,
.nav-tools time {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  color: #dbeafe;
}

.system-pill {
  border: 1px solid rgba(82, 211, 126, 0.2);
  border-radius: 7px;
  background: rgba(34, 197, 94, 0.08);
}

.system-pill i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.75);
}

.avatar {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 34%, #ffe0bd 0 20%, transparent 21%),
    radial-gradient(circle at 50% 78%, #60a5fa 0 34%, transparent 35%),
    #1d4ed8;
}

@media (max-width: 1180px) {
  .top-nav {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  .nav-tools {
    display: none;
  }
}
</style>
