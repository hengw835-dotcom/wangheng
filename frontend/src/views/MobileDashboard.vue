<template>
  <main class="mobile-dashboard">
    <header class="hero">
      <span class="eyebrow">SMART HARVESTER</span>
      <h1>云禾智控</h1>
      <p>{{ store.error || '手机轻量模式已启用，减少地图、图表和动画加载。' }}</p>
      <button type="button" @click="refresh" :disabled="loading">{{ loading ? '刷新中...' : '刷新数据' }}</button>
    </header>

    <section class="kpi-grid">
      <article v-for="item in cards" :key="item.label" class="kpi-card">
        <small>{{ item.label }}</small>
        <strong>{{ item.value }}</strong>
        <span>{{ item.hint }}</span>
      </article>
    </section>

    <section class="quick-actions">
      <button type="button" @click="go('/machines')">设备</button>
      <button type="button" @click="go('/tasks')">任务</button>
      <button type="button" @click="go('/sensors')">传感器</button>
      <button type="button" @click="go('/reports')">报表</button>
    </section>

    <section class="list-card">
      <h2>重点设备</h2>
      <div v-if="!snapshot.topMachines.length" class="empty">暂无设备数据</div>
      <article v-for="machine in snapshot.topMachines.slice(0, 4)" :key="machine.id" class="machine-row">
        <div>
          <strong>{{ machine.id }}</strong>
          <small>{{ machine.type }}</small>
        </div>
        <span>{{ machine.statusText }}</span>
      </article>
    </section>

    <footer>
      <span>后端：{{ store.error ? '离线' : '在线' }}</span>
      <button type="button" @click="authStore.logout()">退出登录</button>
    </footer>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useDashboardStore } from '../store'

const router = useRouter()
const authStore = useAuthStore()
const store = useDashboardStore()
const loading = ref(false)
const snapshot = computed(() => store.snapshot)
const cards = computed(() => [
  { label: '设备总数', value: snapshot.value.kpis?.[0]?.value ?? 0, hint: '在线/离线概览' },
  { label: '任务进度', value: `${snapshot.value.taskProgress?.completedRate ?? 0}%`, hint: '完成率' },
  { label: '告警', value: snapshot.value.alarms?.length ?? 0, hint: '待处理' },
  { label: 'AI状态', value: snapshot.value.ai?.statusText || 'demo', hint: '识别模式' }
])

function go(path) {
  router.push(path)
}

async function refresh() {
  loading.value = true
  try {
    await store.load()
  } catch {
    // Store keeps the error message for display.
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<style scoped>
.mobile-dashboard {
  min-height: 100vh;
  padding: 14px;
  color: #eaf7ff;
  background: linear-gradient(180deg, #071727, #04101c);
  font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
}

.hero,
.kpi-card,
.list-card {
  border: 1px solid rgba(70, 145, 190, .28);
  border-radius: 16px;
  background: rgba(10, 31, 48, .92);
  box-shadow: 0 10px 28px rgba(0, 0, 0, .22);
}

.hero {
  padding: 20px;
}

.eyebrow {
  color: #42d7ff;
  font-size: 11px;
  letter-spacing: .16em;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  font-size: 28px;
}

.hero p {
  margin-top: 8px;
  color: #a9c4d8;
  line-height: 1.6;
}

button {
  min-height: 42px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: #238cff;
  font-weight: 700;
}

.hero button {
  width: 100%;
  margin-top: 16px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.kpi-card {
  display: grid;
  gap: 6px;
  padding: 14px;
}

.kpi-card small,
.kpi-card span,
.machine-row small,
footer {
  color: #91abc0;
}

.kpi-card strong {
  color: #5ee481;
  font-size: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 12px 0;
}

.quick-actions button {
  background: rgba(35, 140, 255, .72);
}

.list-card {
  padding: 16px;
}

.list-card h2 {
  margin-bottom: 12px;
  font-size: 18px;
}

.machine-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid rgba(120, 160, 190, .14);
}

.machine-row div {
  display: grid;
  gap: 3px;
}

.machine-row span {
  color: #5ee481;
}

.empty {
  color: #8ba4b8;
  padding: 20px 0;
  text-align: center;
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 2px 0;
}

footer button {
  min-width: 86px;
  background: rgba(255, 90, 90, .76);
}
</style>
