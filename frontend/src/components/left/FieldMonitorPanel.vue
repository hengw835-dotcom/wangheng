<template>
  <div class="field-monitor">
    <div class="monitor-tabs">
      <div
        class="tab-btn"
        :class="{ active: activeTab === 'outdoor' }"
        @click="activeTab = 'outdoor'"
      >田间监测设备</div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('outdoor')
const emit = defineEmits(['change'])

function switchTab(tab) {
  activeTab.value = tab
  emit('change', tab)
}
</script>

<style scoped>
.field-monitor {
  padding: 0;
}

.monitor-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-card);
  border-radius: 3px;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
}

.tab-btn.active {
  background: rgba(0, 212, 255, 0.12);
  color: var(--color-cyan);
  border-bottom: 2px solid var(--color-cyan);
}
</style>
