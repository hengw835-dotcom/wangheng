<template>
  <div v-if="loading || error || empty" class="request-state" :class="stateClass">
    <el-icon v-if="loading" class="state-icon is-loading"><Loading /></el-icon>
    <el-icon v-else-if="error" class="state-icon is-error"><WarningFilled /></el-icon>
    <el-icon v-else class="state-icon"><Box /></el-icon>

    <strong>{{ title }}</strong>
    <p>{{ message }}</p>

    <el-button v-if="error && retryText" size="small" type="primary" plain @click="$emit('retry')">
      {{ retryText }}
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Box, Loading, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  loadingText: { type: String, default: '数据加载中' },
  emptyText: { type: String, default: '暂无数据' },
  errorTitle: { type: String, default: '加载失败' },
  retryText: { type: String, default: '重试' }
})

defineEmits(['retry'])

const title = computed(() => {
  if (props.loading) return props.loadingText
  if (props.error) return props.errorTitle
  return props.emptyText
})

const message = computed(() => {
  if (props.loading) return '请稍候，正在获取最新业务数据。'
  if (props.error) return props.error
  return '当前筛选条件下没有可展示的记录。'
})

const stateClass = computed(() => ({
  'is-loading': props.loading,
  'is-error': Boolean(props.error),
  'is-empty': props.empty && !props.error && !props.loading
}))
</script>

<style scoped>
.request-state {
  min-height: 220px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 28px;
  color: var(--app-text-muted);
  text-align: center;
}

.request-state strong {
  color: var(--app-text);
  font-size: 16px;
}

.request-state p {
  max-width: 360px;
  line-height: 1.6;
}

.state-icon {
  color: #36c2ff;
  font-size: 28px;
}

.state-icon.is-error {
  color: #ff7d89;
}

.state-icon.is-loading {
  animation: state-spin 1s linear infinite;
}

@keyframes state-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
