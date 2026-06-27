<template>
  <div class="dashboard-card" :class="{ 'no-title': !title }">
    <div v-if="title" class="card-header">
      <div class="header-decoration"></div>
      <span class="header-title">{{ title }}</span>
      <slot name="header-extra"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' }
})
</script>

<style scoped>
.dashboard-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-cyan), transparent);
  opacity: 0.4;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-card);
  position: relative;
}

.header-decoration {
  width: 3px;
  height: 14px;
  background: var(--color-cyan);
  border-radius: 2px;
  margin-right: 8px;
  box-shadow: 0 0 6px var(--color-cyan);
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
  flex: 1;
}

.card-body {
  padding: 10px;
}

.no-title .card-body {
  padding: 10px;
}
</style>
