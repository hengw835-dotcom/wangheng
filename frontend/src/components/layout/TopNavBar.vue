<template>
  <header class="top-nav">
    <button class="brand" type="button" @click="router.push('/')">
      <span class="brand-mark" aria-hidden="true">
        <i></i>
      </span>
      <span class="brand-copy">
        <strong>智能农机系统</strong>
        <small>Smart Harvester Operations</small>
      </span>
    </button>

    <nav class="page-nav" aria-label="页面导航">
      <button
        v-for="item in decoratedNavItems"
        :key="item.path"
        type="button"
        :class="{ active: isActive(item.path) }"
        @click="router.push(item.path)"
      >
        <el-icon><component :is="item.iconComponent" /></el-icon>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="nav-tools">
      <span class="system-pill"><i></i>运行正常</span>
      <time>{{ fullTime }}</time>
      <button class="user-btn" type="button" title="退出登录" @click="authStore.logout()">
        <span class="avatar"></span>
        <span>
          <strong>{{ displayName }}</strong>
          <small>安全会话</small>
        </span>
      </button>
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
import { navItems } from '../../config/navigation'
import { useAuthStore } from '../../store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const now = ref(new Date())
let timer

const iconMap = {
  analysis: DataAnalysis,
  cpu: Cpu,
  home: HomeFilled,
  monitor: Monitor,
  platform: Platform,
  position: Position,
  tickets: Tickets,
  van: Van,
  video: VideoCamera,
  view: View
}

const decoratedNavItems = computed(() => navItems.map(item => ({
  ...item,
  iconComponent: iconMap[item.icon] || HomeFilled
})))

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
  height: 66px;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 0 18px;
  color: #dce8f5;
  background:
    linear-gradient(180deg, rgba(8, 22, 34, .98), rgba(5, 15, 25, .98)),
    #07131e;
  border-bottom: 1px solid rgba(115, 145, 173, .22);
  box-shadow: 0 16px 36px rgba(0, 0, 0, .18);
}

button {
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.brand-mark {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid rgba(82, 211, 126, .42);
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(24, 185, 111, .26), rgba(23, 118, 145, .2));
  box-shadow: inset 0 1px rgba(255,255,255,.14), 0 0 24px rgba(45, 212, 191, .18);
}

.brand-mark i {
  width: 20px;
  height: 24px;
  border-radius: 70% 10% 70% 10%;
  background: linear-gradient(135deg, #9af8a8, #18c984);
  box-shadow: 9px 7px 0 -4px #43e0a4;
  transform: rotate(-28deg);
}

.brand-copy strong {
  display: block;
  overflow: hidden;
  color: #f7fbff;
  font-size: 20px;
  font-weight: 850;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-copy small {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  color: #86a0b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-nav {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.page-nav button {
  height: 38px;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid rgba(105, 133, 158, .24);
  border-radius: 7px;
  color: #aebfd0;
  background: rgba(11, 27, 41, .58);
  font-size: 14px;
  transition: border-color .18s ease, color .18s ease, background .18s ease, transform .18s ease;
}

.page-nav button:hover {
  color: #f0f7ff;
  border-color: rgba(87, 205, 154, .34);
  background: rgba(23, 52, 61, .76);
  transform: translateY(-1px);
}

.page-nav button.active {
  color: #dffff5;
  border-color: rgba(44, 225, 158, .52);
  background: linear-gradient(180deg, rgba(39, 212, 145, .22), rgba(33, 111, 111, .18));
  box-shadow: inset 0 -2px #1fe0a0, 0 8px 20px rgba(31, 224, 160, .1);
}

.page-nav .el-icon {
  font-size: 16px;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.system-pill,
.nav-tools time,
.user-btn {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border: 1px solid rgba(105, 133, 158, .22);
  border-radius: 7px;
  color: #dce8f5;
  background: rgba(8, 22, 34, .56);
}

.system-pill {
  color: #c8ffe2;
  border-color: rgba(82, 211, 126, .22);
  background: rgba(34, 197, 94, .08);
}

.system-pill i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, .75);
}

.user-btn {
  padding-right: 12px;
}

.avatar {
  width: 29px;
  height: 29px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 34%, #ffe0bd 0 20%, transparent 21%),
    radial-gradient(circle at 50% 78%, #60a5fa 0 34%, transparent 35%),
    #1d4ed8;
}

.user-btn strong,
.user-btn small {
  display: block;
  line-height: 1.1;
}

.user-btn small {
  margin-top: 3px;
  color: #7f96aa;
  font-size: 11px;
}

@media (max-width: 1320px) {
  .top-nav {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .nav-tools {
    display: none;
  }
}
</style>
