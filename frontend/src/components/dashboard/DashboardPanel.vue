<template>
  <article class="dashboard-panel">
    <header class="panel-title">
      <h2>{{ title }}</h2>
      <slot name="action">
        <button v-if="action" type="button">{{ action }}</button>
      </slot>
    </header>
    <slot />
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  action: { type: String, default: '' }
})
</script>

<style scoped>
.dashboard-panel {
  min-width: 0;
  padding: 13px;
  border: 1px solid rgba(104, 133, 158, .26);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(15, 35, 50, .96), rgba(8, 23, 35, .98)),
    #081927;
  box-shadow:
    inset 0 1px rgba(255,255,255,.04),
    0 18px 36px rgba(0, 0, 0, .14);
  overflow: hidden;
}

.panel-title {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-title h2 {
  position: relative;
  margin: 0;
  padding-left: 11px;
  color: #f5fbff;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: 0;
}

.panel-title h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 16px;
  border-radius: 3px;
  background: #26e1a0;
  transform: translateY(-50%);
  box-shadow: 0 0 12px rgba(38, 225, 160, .56);
}

.panel-title button {
  border: 0;
  color: #91a7ba;
  background: transparent;
  font-size: 13px;
}
</style>
