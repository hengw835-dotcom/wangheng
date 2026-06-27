<template>
  <header class="top-nav">
    <button class="brand" type="button" @click="router.push('/')">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-copy">
        <strong>云禾智控</strong>
        <small>智能农机调度中心</small>
      </span>
    </button>

    <div class="system-title">
      <strong>{{ title }}</strong>
      <span>Smart Harvester Operations</span>
    </div>

    <div class="nav-tools">
      <span class="system-pill"><i></i>系统运行正常</span>
      <span class="weather">26°C 多云</span>
      <button class="alert-btn" type="button" title="告警中心">
        告警
        <em>12</em>
      </button>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store'

defineProps({
  title: { type: String, default: '智能农机调度中心' }
})

const router = useRouter()
const authStore = useAuthStore()
const now = ref(new Date())
let timer

const displayName = computed(() => authStore.username || '管理员')
const fullTime = computed(() => now.value.toLocaleString('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).replace(/\//g, '-'))

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
  grid-template-columns: 220px minmax(260px, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 0 20px;
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
  text-align: left;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background:
    radial-gradient(circle at 34% 32%, #7cf5a2 0 18%, transparent 19%),
    conic-gradient(from 210deg, #32d583, #2dd4bf, #47a3ff, #32d583);
  box-shadow: 0 0 24px rgba(45, 212, 191, 0.26);
}

.brand-copy strong,
.system-title strong {
  display: block;
  color: #f8fbff;
  font-weight: 900;
  letter-spacing: 0;
}

.brand-copy strong {
  font-size: 24px;
}

.brand-copy small,
.system-title span {
  color: #8ea8c3;
  font-size: 12px;
}

.system-title strong {
  font-size: 22px;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
}

.system-pill,
.weather,
.alert-btn,
.user-btn,
.nav-tools time {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-left: 1px solid rgba(137, 160, 188, 0.2);
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

.alert-btn {
  position: relative;
}

.alert-btn em {
  position: absolute;
  right: -2px;
  top: 3px;
  min-width: 18px;
  height: 18px;
  border-radius: 99px;
  color: #fff;
  background: #ef4444;
  font-size: 11px;
  font-style: normal;
  line-height: 18px;
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
    grid-template-columns: 210px 1fr;
  }

  .nav-tools {
    display: none;
  }
}
</style>
