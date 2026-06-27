<template>
  <DashboardCard title="视频监控">
    <div class="video-panel">
      <div class="main-video">
        <div class="video-placeholder">
          <div class="video-overlay">
            <svg viewBox="0 0 48 48" width="40" height="40" class="play-btn">
              <circle cx="24" cy="24" r="20" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
              <polygon points="18,14 36,24 18,34" fill="rgba(255,255,255,0.8)"/>
            </svg>
          </div>
          <div class="video-label">{{ machines[activeIndex]?.model || '收割机实时画面' }}</div>
          <div class="video-status">
            <span class="status-dot" :class="statusClass"></span>
            {{ machines[activeIndex]?.status === 'WORKING' ? '作业中' : '待机' }}
          </div>
        </div>
      </div>
      <div class="thumbnail-strip">
        <div class="thumb-arrow" @click="scrollThumbs(-1)">&lt;</div>
        <div class="thumb-list">
          <div
            v-for="(m, i) in displayMachines"
            :key="i"
            class="thumb-item"
            :class="{ active: i + thumbOffset === activeIndex }"
            @click="activeIndex = i + thumbOffset"
          >
            <div class="thumb-placeholder">
              <span class="thumb-label">CAM{{ i + thumbOffset + 1 }}</span>
            </div>
          </div>
        </div>
        <div class="thumb-arrow" @click="scrollThumbs(1)">&gt;</div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import DashboardCard from '../common/DashboardCard.vue'

const props = defineProps({
  machines: { type: Array, default: () => [] }
})

const activeIndex = ref(0)
const thumbOffset = ref(0)

const displayMachines = computed(() => {
  return props.machines.slice(thumbOffset.value, thumbOffset.value + 4)
})

const statusClass = computed(() => {
  const s = props.machines[activeIndex.value]?.status
  if (s === 'WORKING') return 'working'
  if (s === 'ONLINE') return 'online'
  if (s === 'ERROR') return 'error'
  return 'offline'
})

function scrollThumbs(dir) {
  const next = thumbOffset.value + dir
  if (next >= 0 && next + 4 <= Math.max(props.machines.length, 4)) {
    thumbOffset.value = next
  }
}
</script>

<style scoped>
.video-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-video {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a2a1a 0%, #0d3320 40%, #0a2a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-overlay {
  cursor: pointer;
  z-index: 2;
}

.play-btn {
  opacity: 0.7;
  transition: opacity 0.3s;
}

.play-btn:hover {
  opacity: 1;
}

.video-label {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 2px;
  z-index: 2;
}

.video-status {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #666;
}

.status-dot.working { background: var(--color-green); box-shadow: 0 0 6px var(--color-green); }
.status-dot.online { background: var(--color-cyan); }
.status-dot.error { background: var(--color-red); }
.status-dot.offline { background: #666; }

.thumbnail-strip {
  display: flex;
  align-items: center;
  gap: 6px;
}

.thumb-arrow {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  border: 1px solid var(--border-card);
  border-radius: 2px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.thumb-arrow:hover {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
}

.thumb-list {
  display: flex;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}

.thumb-item {
  flex: 1;
  aspect-ratio: 16 / 10;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.3s;
}

.thumb-item.active {
  border-color: var(--color-cyan);
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a2a1a, #0d3320);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-label {
  font-size: 10px;
  color: var(--text-muted);
}
</style>
