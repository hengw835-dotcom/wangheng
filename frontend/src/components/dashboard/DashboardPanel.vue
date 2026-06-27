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
  padding: 12px;
  border: 1px solid rgba(74, 111, 137, .38);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(13, 32, 46, .98), rgba(8, 25, 38, .98));
  box-shadow: inset 0 1px rgba(255,255,255,.03);
  overflow: hidden;
}

.panel-title {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-title h2 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.panel-title button {
  border: 0;
  color: #9eb0c0;
  background: transparent;
}
</style>
