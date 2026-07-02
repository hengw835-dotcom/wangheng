<template>
  <div class="screen yh-cockpit">
    <aside class="sidebar">
      <button class="brand" type="button" @click="router.push('/')">
        <span class="leaf-mark"></span>
        <strong>智能农机系统</strong>
      </button>

      <nav class="side-menu">
        <button
          v-for="item in sideItems"
          :key="item.label"
          type="button"
          :class="{ active: route.path === item.path }"
          @click="router.push(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button class="collapse-btn" type="button">
        <span>≪</span>
        收起菜单
      </button>
    </aside>

    <section class="main">
      <header class="topbar">
        <div class="status-line">
          <span>系统状态：<i class="ok-dot"></i><b>{{ store.error ? '接口异常' : '运行正常' }}</b></span>
          <span><el-icon><Connection /></el-icon>API {{ snapshot.kpis[0]?.sub || '--' }}</span>
          <span>AI {{ snapshot.ai.statusText }}</span>
          <span>定位能力：{{ capabilityText.navigation }}</span>
        </div>

        <div class="top-actions">
          <button v-for="action in topActions" :key="action.label" type="button">
            <el-icon><component :is="action.icon" /></el-icon>{{ action.label }}
          </button>
          <button class="bell" type="button"><el-icon><Bell /></el-icon><em>{{ snapshot.alarms.length }}</em></button>
          <button class="profile" type="button" @click="authStore.logout()">
            <span class="avatar"></span>
            <span><strong>{{ authStore.username || '管理员' }}</strong><small>{{ roleText }}</small></span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </div>
      </header>

      <main class="content">
        <div v-if="store.loading" class="state-banner">正在加载调度总览数据...</div>
        <div v-else-if="store.error" class="state-banner error">{{ store.error }}</div>

        <section class="kpis">
          <KpiCard v-for="item in snapshot.kpis" :key="item.title" :item="item" />
        </section>

        <section class="layout-grid">
          <DashboardPanel title="中央GIS作业地图" class="gis-panel">
            <GisMap :machines="snapshot.topMachines" :fields="snapshot.fields" />
          </DashboardPanel>

          <DashboardPanel title="设备状态 TOP5" action="在线率" class="device-panel">
            <div v-if="!snapshot.topMachines.length" class="empty-state">暂无设备数据</div>
            <div v-for="(item, index) in snapshot.topMachines" :key="item.id" class="rank-row">
              <span>{{ index + 1 }}</span>
              <b>{{ item.id }}</b>
              <small>{{ item.type }}</small>
              <i><em :style="{ width: item.rate + '%' }"></em></i>
              <strong>{{ item.rate }}%</strong>
            </div>
          </DashboardPanel>

          <DashboardPanel title="任务进度环图" class="ring-panel">
            <div class="ring-wrap">
              <div class="ring" :style="taskRingStyle">
                <strong>{{ snapshot.taskProgress.running }}个</strong>
                <span>进行中</span>
              </div>
              <ul>
                <li><i class="blue"></i>未开始 <b>{{ snapshot.taskProgress.pending }}</b></li>
                <li><i class="cyan"></i>进行中 <b>{{ snapshot.taskProgress.running }}</b></li>
                <li><i class="green"></i>已完成 <b>{{ snapshot.taskProgress.completed }}</b></li>
              </ul>
            </div>
            <footer><span>总任务 {{ snapshot.taskProgress.total }}个</span><b>完成率 {{ snapshot.taskProgress.completedRate }}%</b></footer>
          </DashboardPanel>

          <DashboardPanel title="传感器告警列表" class="alarm-panel">
            <template #action>
              <b class="danger-text">{{ snapshot.alarms.length }} 条未处理</b>
            </template>
            <template #default>
              <DashboardTable :columns="alarmColumns" :items="snapshot.alarms" empty-text="暂无告警">
                <template #level="{ row }"><span :class="['tag', row.level]">{{ row.levelText }}</span></template>
                <template #status="{ row }"><span :class="['tag', row.status]">{{ row.statusText }}</span></template>
              </DashboardTable>
            </template>
          </DashboardPanel>

          <DashboardPanel title="AI识别当前画面" class="ai-panel">
            <template #action><span class="detecting"><i></i>{{ snapshot.ai.statusText }}</span></template>
            <div class="ai-image">
              <span class="box crop">{{ snapshot.ai.detectionType }} {{ snapshot.ai.confidence.toFixed(2) }}</span>
            </div>
            <div class="ai-foot">
              <span>识别类型 <b>{{ snapshot.ai.detectionType }}</b></span>
              <span>置信度 <strong>{{ snapshot.ai.confidence.toFixed(2) }}</strong></span>
              <span><i></i>{{ capabilityText.aiVision }}</span>
            </div>
          </DashboardPanel>

          <section class="chart-pair">
            <DashboardPanel title="作业面积趋势图" class="chart-panel">
              <TrendChart unit="亩" :today="snapshot.trends.areaToday" :yesterday="snapshot.trends.areaYesterday" />
            </DashboardPanel>

            <DashboardPanel title="油耗趋势图" class="chart-panel">
              <TrendChart unit="L" :today="snapshot.trends.fuelToday" :yesterday="snapshot.trends.fuelYesterday" />
            </DashboardPanel>
          </section>

          <DashboardPanel title="最新事件表" class="events-panel">
            <DashboardTable :columns="eventColumns" :items="snapshot.events" empty-text="暂无事件">
              <template #type="{ row }"><b :class="row.tone">{{ row.type }}</b></template>
              <template #status="{ row }"><span :class="['tag', row.status]">{{ row.statusText }}</span></template>
            </DashboardTable>
          </DashboardPanel>
        </section>
      </main>

      <footer class="footer-bar">
        <span><el-icon><Clock /></el-icon>数据更新时间：{{ snapshot.lastUpdated }}</span>
        <b><i></i>{{ store.error ? '离线' : '实时' }}</b>
        <span>WebSocket连接状态：<b><i></i>{{ capabilityText.control }}</b></span>
        <span>MQTT连接状态：<b><i></i>{{ capabilityText.control }}</b></span>
        <span>服务器时间：{{ clockText }}</span>
        <span class="signal"><i></i><i></i><i></i></span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Aim,
  ArrowDown,
  Bell,
  Clock,
  Connection,
  Cpu,
  DataAnalysis,
  Grid,
  HomeFilled,
  Location,
  Monitor,
  Platform,
  Position,
  Refresh,
  Setting,
  Tickets,
  Van,
  VideoCamera,
  View
} from '@element-plus/icons-vue'
import DashboardPanel from '../components/dashboard/DashboardPanel.vue'
import DashboardTable from '../components/dashboard/DashboardTable.vue'
import GisMap from '../components/dashboard/GisMap.vue'
import KpiCard from '../components/dashboard/KpiCard.vue'
import TrendChart from '../components/dashboard/TrendChart.vue'
import { useAuthStore, useDashboardStore } from '../store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const store = useDashboardStore()
const clock = ref(new Date())
let timer

const snapshot = computed(() => store.snapshot)
const roleText = computed(() => authStore.roles?.[0]?.replace('ROLE_', '') || '登录用户')
const clockText = computed(() => clock.value.toLocaleTimeString('zh-CN', { hour12: false }))
const capabilityText = computed(() => ({
  aiVision: snapshot.value.ai.statusText || 'unknown',
  navigation: snapshot.value.kpis[0] ? '已接入' : 'unknown',
  control: store.error ? '未连接' : '已接入'
}))

const taskRingStyle = computed(() => {
  const total = snapshot.value.taskProgress.total || 1
  const completed = Math.round((snapshot.value.taskProgress.completed / total) * 100)
  const running = Math.round((snapshot.value.taskProgress.running / total) * 100)
  return {
    background: `radial-gradient(circle at center, #07131e 0 48%, transparent 49%), conic-gradient(#54d783 0 ${completed}%, #3b99ff ${completed}% ${completed + running}%, #cfe7ff ${completed + running}% 100%)`
  }
})

const sideItems = [
  { label: '调度总览', path: '/', icon: HomeFilled },
  { label: '设备管理', path: '/machines', icon: Platform },
  { label: '任务管理', path: '/tasks', icon: Tickets },
  { label: '实时控制', path: '/monitor', icon: Cpu },
  { label: 'AI视觉识别', path: '/vision', icon: VideoCamera },
  { label: '传感器数据', path: '/sensors', icon: Position },
  { label: '传感器模拟器', path: '/simulator', icon: Monitor },
  { label: '数据报表', path: '/reports', icon: DataAnalysis },
  { label: '综合大屏', path: '/integrated', icon: View },
  { label: '旧首页', path: '/home', icon: Van },
  { label: '登录与权限', path: '/', icon: Setting }
]

const topActions = [
  { label: 'MQTT控制', icon: Connection },
  { label: '北斗定位', icon: Location },
  { label: '传感器融合', icon: Aim },
  { label: 'WebSocket', icon: Refresh },
  { label: '报表分析', icon: DataAnalysis }
]

const alarmColumns = [
  { key: 'time', label: '时间' },
  { key: 'device', label: '设备' },
  { key: 'type', label: '告警类型' },
  { key: 'level', label: '级别' },
  { key: 'status', label: '状态' }
]

const eventColumns = [
  { key: 'time', label: '时间' },
  { key: 'device', label: '设备ID' },
  { key: 'type', label: '事件类型' },
  { key: 'content', label: '事件内容' },
  { key: 'status', label: '状态' }
]

onMounted(async () => {
  timer = window.setInterval(() => {
    clock.value = new Date()
  }, 1000)
  try {
    await store.load()
  } catch {
    // Error text is stored in Pinia and shown in the banner.
  }
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<style scoped>
.screen {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 238px minmax(0, 1fr);
  color: #d4e3ef;
  background:
    radial-gradient(circle at 18% 8%, rgba(38, 225, 160, .08), transparent 28%),
    radial-gradient(circle at 94% 14%, rgba(59, 130, 246, .08), transparent 26%),
    #07131d;
  font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
}

button {
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.sidebar {
  display: grid;
  grid-template-rows: 68px 1fr 46px;
  background:
    linear-gradient(180deg, rgba(8, 26, 38, .98), rgba(7, 19, 30, .98)),
    #081520;
  border-right: 1px solid rgba(117, 145, 169, .2);
  box-shadow: 12px 0 30px rgba(0, 0, 0, .16);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 22px;
  color: #fff;
  border-bottom: 1px solid rgba(117, 145, 169, .16);
}

.brand strong {
  font-size: 22px;
  font-weight: 850;
  letter-spacing: 0;
}

.leaf-mark {
  width: 28px;
  height: 32px;
  border-radius: 60% 10% 60% 10%;
  background: linear-gradient(135deg, #6cf57e, #16c784);
  box-shadow: 12px 8px 0 -3px #34d399, 0 0 18px rgba(52, 211, 153, .35);
  transform: rotate(-28deg);
}

.side-menu {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 14px 10px;
}

.side-menu button {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0 15px;
  border: 1px solid transparent;
  border-radius: 7px;
  color: #9fb0c0;
  font-size: 15px;
  transition: background .18s ease, border-color .18s ease, color .18s ease;
}

.side-menu button:hover {
  color: #edf7ff;
  border-color: rgba(103, 132, 156, .2);
  background: rgba(14, 35, 50, .68);
}

.side-menu button.active {
  color: #dffff5;
  border-color: rgba(38, 225, 160, .28);
  background: linear-gradient(90deg, rgba(38, 225, 160, .22), rgba(36, 96, 88, .26));
  box-shadow: inset 3px 0 #26e1a0;
}

.collapse-btn {
  margin: 0 10px 10px;
  border: 1px solid rgba(117, 145, 169, .16);
  border-radius: 7px;
  color: #c5d2de;
  background: rgba(133, 156, 181, .1);
}

.collapse-btn span {
  margin-right: 18px;
  font-size: 22px;
}

.main {
  display: grid;
  grid-template-rows: 68px 1fr 44px;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 18px;
  background: rgba(7, 19, 30, .86);
  border-bottom: 1px solid rgba(117, 145, 169, .18);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.status-line,
.top-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
}

.status-line span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  color: #b8c8d6;
}

.status-line b,
.footer-bar b {
  color: #22e288;
  font-weight: 700;
}

.ok-dot,
.footer-bar i {
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  background: #22e288;
  box-shadow: 0 0 10px rgba(34, 226, 136, .7);
}

.top-actions button {
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid rgba(103, 132, 156, .28);
  border-radius: 7px;
  color: #d6e5f1;
  background: rgba(12, 28, 42, .64);
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}

.top-actions button:hover {
  border-color: rgba(38, 225, 160, .35);
  background: rgba(21, 47, 53, .78);
  transform: translateY(-1px);
}

.bell {
  position: relative;
  width: 38px;
  padding: 0 !important;
  justify-content: center;
  border: 0 !important;
}

.bell em {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #fff;
  background: #ef4444;
  font-size: 12px;
  font-style: normal;
  line-height: 20px;
}

.profile {
  border: 0 !important;
  background: transparent !important;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 32%, #f7d1b8 0 22%, transparent 23%),
    radial-gradient(circle at 50% 78%, #60a5fa 0 36%, transparent 37%),
    #1d4ed8;
}

.profile small {
  display: block;
  color: #8c9dad;
}

.content {
  min-width: 0;
  padding: 12px 14px 10px;
  overflow: auto;
}

.state-banner {
  min-height: 34px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 12px;
  border: 1px solid rgba(59, 130, 246, .28);
  border-radius: 6px;
  color: #bfdbfe;
  background: rgba(30, 64, 175, .14);
}

.state-banner.error {
  color: #fecaca;
  border-color: rgba(239, 68, 68, .34);
  background: rgba(127, 29, 29, .22);
}

.kpis {
  min-height: 122px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.layout-grid {
  min-height: 744px;
  display: grid;
  grid-template-columns: minmax(620px, 1.45fr) minmax(300px, .7fr) minmax(300px, .7fr);
  grid-template-rows: 266px 286px 256px;
  gap: 10px;
}

.gis-panel {
  grid-row: span 2;
  position: relative;
  padding: 0;
}

.gis-panel :deep(.panel-title) {
  position: absolute;
  z-index: 5;
  left: 16px;
  top: 14px;
}

.rank-row {
  height: 36px;
  display: grid;
  grid-template-columns: 24px 68px 58px 1fr 42px;
  align-items: center;
  gap: 10px;
  color: #bcd0df;
  border-bottom: 1px solid rgba(110, 139, 164, .1);
}

.rank-row > span {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  color: #06202d;
  background: #f6bd38;
  font-weight: 800;
}

.rank-row:nth-child(3) > span { background: #87c5ff; }
.rank-row:nth-child(4) > span { background: #e0a06c; }
.rank-row:nth-child(n+5) > span { background: #334155; color: #cbd5e1; }
.rank-row b { color: #dff2ff; }
.rank-row i { height: 9px; border-radius: 9px; background: rgba(148, 163, 184, .18); overflow: hidden; }
.rank-row em { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #4ea1ff, #5ee481); }
.rank-row strong { color: #5ee481; }

.ring-wrap {
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  gap: 18px;
}

.ring {
  width: 135px;
  height: 135px;
  display: grid;
  place-items: center;
  align-content: center;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.04), 0 0 26px rgba(59, 130, 246, .08);
}

.ring strong {
  color: #fff;
  font-size: 28px;
}

.ring span,
.ring-panel li {
  color: #b8c6d2;
}

.ring-panel ul {
  display: grid;
  gap: 18px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.ring-panel li {
  display: flex;
  justify-content: space-between;
}

.ring-panel li i {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 2px;
}

.ring-panel footer {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  color: #aab8c8;
}

.ring-panel footer b {
  color: #54d783;
}

.green { background: #36e27f; }
.blue { background: #3aa5ff; }
.cyan { background: #22d3ee; }

.danger-text {
  color: #ef4444;
  font-size: 13px;
}

.inline-title {
  display: none;
}

.tag {
  display: inline-grid;
  place-items: center;
  min-width: 48px;
  height: 22px;
  padding: 0 8px;
  border-radius: 99px;
  color: #fff;
  font-size: 12px;
}

.tag.danger,
.tag.todo {
  background: rgba(239, 68, 68, .58);
}

.tag.warning,
.tag.normal,
.tag.pending {
  background: rgba(202, 138, 4, .62);
}

.tag.done,
.tag.success {
  background: rgba(34, 197, 94, .42);
}

.ai-image {
  position: relative;
  height: 186px;
  border-radius: 7px;
  overflow: hidden;
  background:
    linear-gradient(80deg, rgba(250, 204, 21, .17) 8px, transparent 9px) 0 0 / 20px 20px,
    linear-gradient(180deg, #dceefe 0 32%, #a97934 33% 100%);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.05);
}

.ai-image::before {
  content: '';
  position: absolute;
  left: 35%;
  top: 44%;
  width: 170px;
  height: 60px;
  border-radius: 8px;
  border: 8px solid #263238;
  background: #d7d3ca;
  transform: rotate(5deg);
}

.box {
  position: absolute;
  left: 34%;
  top: 16%;
  width: 122px;
  height: 78px;
  padding: 2px 6px;
  border: 2px solid #56e87f;
  border-radius: 4px;
  color: #fff;
  background: rgba(21, 128, 61, .6);
  font-size: 13px;
  box-shadow: 0 0 16px rgba(86, 232, 127, .2);
}

.ai-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  color: #b8c6d2;
}

.ai-foot b,
.ai-foot strong {
  color: #ef4444;
}

.ai-foot i,
.detecting i {
  width: 8px;
  height: 8px;
  display: inline-block;
  margin-right: 6px;
  border-radius: 50%;
  background: #22e288;
}

.chart-pair {
  grid-column: 1;
  grid-row: 3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-width: 0;
  min-height: 0;
}

.events-panel {
  grid-column: 2 / 4;
  grid-row: 3;
}

.green-text { color: #22e288; }
.red-text { color: #ef4444; }
.empty-state {
  display: grid;
  place-items: center;
  min-height: 160px;
  color: #71879a;
}

.footer-bar {
  display: grid;
  grid-template-columns: 260px 120px 1fr 1fr 220px 60px;
  align-items: center;
  gap: 18px;
  padding: 0 16px;
  color: #9eacba;
  background: rgba(7, 22, 34, .96);
  border-top: 1px solid rgba(117, 145, 169, .18);
}

.footer-bar span,
.footer-bar b {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.signal {
  justify-content: end;
}

.signal i {
  width: 5px;
  border-radius: 1px;
  background: #22e288;
}

.signal i:nth-child(1) { height: 10px; }
.signal i:nth-child(2) { height: 17px; }
.signal i:nth-child(3) { height: 24px; }

@media (max-width: 1500px) {
  .screen {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .top-actions {
    display: none;
  }

  .kpis {
    height: auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .layout-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 390px 240px 260px 240px;
    min-height: 0;
  }

  .gis-panel {
    grid-column: 1 / 3;
    grid-row: 1;
  }

  .chart-pair {
    grid-column: 1 / 3;
    grid-row: 3;
  }

  .events-panel {
    grid-column: 1 / 3;
    grid-row: 4;
  }

  .footer-bar {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
