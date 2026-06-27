<template>
  <div class="home-container">
    <!-- 背景效果 -->
    <div class="bg-effect">
      <div class="bg-grid"></div>
      <div class="bg-glow"></div>
    </div>

    <!-- 系统标题 -->
    <div class="system-title">
      <h1>智能农机收割系统</h1>
      <div class="title-subtitle">INTELLIGENT AGRICULTURAL MACHINERY SYSTEM</div>
      <div class="title-glow"></div>
    </div>

    <!-- 系统概览 -->
    <div class="overview-section">
      <div class="section-title">
        <span>系统概览</span>
        <div class="title-line"></div>
      </div>
      <div class="overview-stats">
        <div class="stat-card">
          <div class="stat-icon">🚜</div>
          <el-statistic :value="onlineMachines" suffix="台" class="stat-value">
            <template #title>
              <span class="stat-title">在线农机</span>
            </template>
          </el-statistic>
          <div class="stat-glow"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <el-statistic :value="activeTasks" suffix="个" class="stat-value">
            <template #title>
              <span class="stat-title">活跃任务</span>
            </template>
          </el-statistic>
          <div class="stat-glow"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌾</div>
          <el-statistic :value="todayHarvest" suffix="亩" class="stat-value">
            <template #title>
              <span class="stat-title">今日收割面积</span>
            </template>
          </el-statistic>
          <div class="stat-glow"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <el-statistic :value="estimatedYield" suffix="吨" class="stat-value">
            <template #title>
              <span class="stat-title">预估产量</span>
            </template>
          </el-statistic>
          <div class="stat-glow"></div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="section-title">
        <span>数据可视化</span>
        <div class="title-line"></div>
      </div>
      <el-row :gutter="30">
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <span>收割进度</span>
              <div class="header-glow"></div>
            </div>
            <div ref="progressChart" class="chart"></div>
            <div class="card-glow"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <span>产量分布</span>
              <div class="header-glow"></div>
            </div>
            <div ref="yieldChart" class="chart"></div>
            <div class="card-glow"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <div class="section-title">
        <span>最近任务</span>
        <div class="title-line"></div>
      </div>
      <div class="tasks-card">
        <el-table :data="recentTasks" class="tasks-table">
          <el-table-column prop="taskId" label="任务ID" width="180">
            <template #default="scope">
              <span class="table-cell">{{ scope.row.taskId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fieldName" label="地块名称">
            <template #default="scope">
              <span class="table-cell">{{ scope.row.fieldName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="machineId" label="农机ID" width="120">
            <template #default="scope">
              <span class="table-cell">{{ scope.row.machineId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :class="['status-tag', `status-${scope.row.status.toLowerCase()}`]">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="completedArea" label="完成面积(亩)" width="140">
            <template #default="scope">
              <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: `${(scope.row.completedArea / 100) * 100}%` }"></div>
                <span class="progress-text">{{ scope.row.completedArea }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="card-glow"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'Home',
  setup() {
    const onlineMachines = ref(5)
    const activeTasks = ref(3)
    const todayHarvest = ref(120)
    const estimatedYield = ref(25)
    const progressChart = ref(null)
    const yieldChart = ref(null)
    const recentTasks = ref([
      { taskId: 'task-001', fieldName: '东地块', machineId: 'machine-001', status: 'IN_PROGRESS', completedArea: 45 },
      { taskId: 'task-002', fieldName: '西地块', machineId: 'machine-002', status: 'PENDING', completedArea: 0 },
      { taskId: 'task-003', fieldName: '南地块', machineId: 'machine-003', status: 'COMPLETED', completedArea: 75 }
    ])

    const initProgressChart = () => {
      const chart = echarts.init(progressChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowColor: 'rgba(0, 255, 255, 0.3)'
          },
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['东地块', '西地块', '南地块', '北地块'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '完成面积(亩)',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '完成面积',
            type: 'bar',
            data: [45, 0, 75, 30],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ffff' },
                { offset: 1, color: '#0066ff' }
              ]),
              borderColor: '#00ffff',
              borderWidth: 1
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 255, 255, 0.5)'
              }
            }
          },
          {
            name: '目标面积',
            type: 'bar',
            data: [100, 80, 75, 90],
            itemStyle: {
              color: 'rgba(0, 255, 255, 0.2)',
              borderColor: 'rgba(0, 255, 255, 0.5)',
              borderWidth: 1
            }
          }
        ]
      }
      chart.setOption(option)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        chart.resize()
      })
    }

    const initYieldChart = () => {
      const chart = echarts.init(yieldChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#ffffff'
          }
        },
        series: [
          {
            name: '产量分布',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 12, name: '东地块' },
              { value: 8, name: '西地块' },
              { value: 5, name: '南地块' }
            ],
            itemStyle: {
              borderColor: '#0a0a20',
              borderWidth: 2
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 255, 255, 0.5)'
              }
            },
            label: {
              color: '#ffffff'
            },
            labelLine: {
              lineStyle: {
                color: '#00ffff'
              }
            }
          }
        ]
      }
      chart.setOption(option)
      
      // 响应式调整
      window.addEventListener('resize', () => {
        chart.resize()
      })
    }

    onMounted(() => {
      initProgressChart()
      initYieldChart()
    })

    return {
      onlineMachines,
      activeTasks,
      todayHarvest,
      estimatedYield,
      progressChart,
      yieldChart,
      recentTasks
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.home-container {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a20 0%, #1a1a40 100%);
  color: #ffffff;
}

/* 背景效果 */
.bg-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: glowPulse 4s ease-in-out infinite;
}

/* 系统标题 */
.system-title {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.system-title h1 {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ffff, #0066ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.title-subtitle {
  font-size: 1rem;
  color: rgba(0, 255, 255, 0.7);
  letter-spacing: 3px;
}

.title-glow {
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  transform: translateX(-50%);
  animation: lineGlow 2s ease-in-out infinite;
}

/* 章节标题 */
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.section-title span {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ffff;
  margin-right: 10px;
}

.title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #00ffff, transparent);
}

/* 概览统计 */
.overview-section {
  margin-bottom: 40px;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  min-width: 200px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  animation: iconPulse 2s ease-in-out infinite;
}

.stat-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  color: #00ffff !important;
  font-size: 1.8rem !important;
  font-weight: bold !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.stat-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 40px;
}

.chart-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  height: 350px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.chart-header span {
  font-size: 1.1rem;
  font-weight: bold;
  color: #00ffff;
}

.header-glow {
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100px;
  height: 1px;
  background: linear-gradient(90deg, #00ffff, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

.chart {
  width: 100%;
  height: calc(100% - 50px);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 255, 255, 0.05) 50%, transparent 100%);
  pointer-events: none;
}

/* 任务列表 */
.tasks-section {
  margin-bottom: 40px;
}

.tasks-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.tasks-table {
  background: transparent !important;
  border: none !important;
}

.tasks-table th {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
}

.tasks-table td {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.table-cell {
  transition: all 0.3s ease;
}

.table-cell:hover {
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.status-tag {
  border-radius: 12px;
  font-size: 0.8rem;
  padding: 2px 10px;
  font-weight: bold;
}

.status-in_progress {
  background: rgba(255, 165, 0, 0.2);
  border: 1px solid orange;
  color: orange;
}

.status-pending {
  background: rgba(0, 123, 255, 0.2);
  border: 1px solid #007bff;
  color: #007bff;
}

.status-completed {
  background: rgba(40, 167, 69, 0.2);
  border: 1px solid #28a745;
  color: #28a745;
}

.progress-bar-container {
  position: relative;
  height: 20px;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0066ff);
  border-radius: 10px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

/* 动画效果 */
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes lineGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .system-title h1 {
    font-size: 2rem;
  }
  
  .overview-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-card {
    width: 100%;
    max-width: 300px;
  }
  
  .chart-card {
    height: 300px;
  }
}
</style>