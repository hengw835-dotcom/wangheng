<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">AI VISION</span>
          <h1>视觉识别</h1>
          <p>上传田间或农机图片，调用真实后端 `/ai-vision/detect`，并按后端像素坐标绘制检测框。</p>
        </div>
        <div class="mode-card" :class="visionMode">
          <strong>{{ capabilityLabel(visionMode) }}</strong>
          <small>{{ modeDescription }}</small>
        </div>
      </section>

      <el-alert
        v-if="visionMode !== 'real'"
        class="mode-alert"
        type="warning"
        :closable="false"
        show-icon
        title="当前后端视觉识别仍可能是演示模式，结果不能作为真实模型精度依据。"
      />

      <section class="content-grid">
        <article class="panel upload-panel">
          <header>
            <h2>图片识别</h2>
            <el-button type="primary" :loading="loading" :disabled="!selectedFile || Boolean(fileError)" @click="detect">开始识别</el-button>
          </header>

          <label class="upload-box">
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="selectFile" />
            <template v-if="previewUrl">
              <img ref="previewImage" :src="previewUrl" alt="待识别图片" @load="captureImageSize" />
              <span
                v-for="(item, index) in results"
                :key="index"
                class="detection-box"
                :style="boxStyle(item)"
              >
                {{ readableLabel(item.label) }} {{ Math.round(Number(item.confidence || 0) * 100) }}%
              </span>
            </template>
            <template v-else>
              <strong>选择图片</strong>
              <span>支持 JPG、PNG、WebP，最大 10MB</span>
            </template>
          </label>
          <p v-if="fileError" class="error-text">{{ fileError }}</p>
        </article>

        <article class="panel result-panel">
          <header>
            <h2>识别结果</h2>
            <span>{{ results.length }} 个目标</span>
          </header>

          <el-empty v-if="results.length === 0" description="上传图片并点击开始识别后展示结果" />
          <div v-else class="result-list">
            <article v-for="(item, index) in results" :key="index">
              <div>
                <strong>{{ readableLabel(item.label) }}</strong>
                <span>位置 x{{ item.x }} y{{ item.y }} / {{ item.width }}x{{ item.height }}</span>
              </div>
              <el-progress :percentage="Math.round(Number(item.confidence || 0) * 100)" />
            </article>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { useSystemStore } from '../store'
import { aiVisionApi } from '../services/api'
import { normalizeDetectionBox, validateAiImage } from '../utils/analyticsModel'

const systemStore = useSystemStore()
const selectedFile = ref(null)
const previewUrl = ref('')
const results = ref([])
const loading = ref(false)
const fileError = ref('')
const previewImage = ref(null)
const imageSize = reactive({ width: 1, height: 1 })

const visionMode = computed(() => systemStore.capabilities.aiVision || 'unknown')
const modeDescription = computed(() => {
  if (visionMode.value === 'real') return '已配置真实模型服务'
  if (visionMode.value === 'demo') return '演示识别结果'
  if (visionMode.value === 'disabled') return '能力未启用'
  return '等待后端能力接口返回'
})

function capabilityLabel(mode) {
  return { real: '真实接入', demo: '演示模式', disabled: '未启用', unknown: '未知状态' }[mode] || mode
}

function selectFile(event) {
  const file = event.target.files?.[0] || null
  fileError.value = validateAiImage(file)
  selectedFile.value = fileError.value ? null : file
  results.value = []
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file && !fileError.value ? URL.createObjectURL(file) : ''
}

function captureImageSize() {
  imageSize.width = previewImage.value?.naturalWidth || 1
  imageSize.height = previewImage.value?.naturalHeight || 1
}

function boxStyle(item) {
  const box = normalizeDetectionBox(item, imageSize)
  return { left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }
}

async function detect() {
  if (!selectedFile.value) return
  loading.value = true
  try {
    results.value = await aiVisionApi.detect(selectedFile.value)
    ElMessage.success('识别请求已完成')
  } finally {
    loading.value = false
  }
}

function readableLabel(label) {
  return String(label || '未知目标')
}

onMounted(() => systemStore.checkHealth())
onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
.page-root { height: 100%; background: var(--app-page-bg); }
.workspace { height: calc(100% - 72px); overflow: auto; padding: 22px; }
.page-head, .panel header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-head { margin-bottom: 16px; }
.eyebrow { color: #36c2ff; font-size: 12px; letter-spacing: .16em; }
h1 { margin-top: 8px; color: #fff; font-size: 34px; }
p, span, small { color: var(--app-text-muted); }
.mode-card { min-width: 220px; padding: 14px; border: 1px solid rgba(255,211,122,.35); border-radius: 14px; background: rgba(255,211,122,.08); }
.mode-card.real { border-color: rgba(34,217,131,.35); background: rgba(34,217,131,.08); }
.mode-card strong, .panel h2 { display: block; color: #fff; }
.mode-alert { margin-bottom: 16px; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, .8fr); gap: 16px; }
.panel { padding: 18px; border: 1px solid var(--app-panel-border); border-radius: 16px; background: var(--app-panel-bg); }
.upload-box { position: relative; min-height: 460px; display: grid; place-items: center; gap: 10px; text-align: center; border: 1px dashed rgba(66,137,199,.42); border-radius: 14px; background: rgba(3,16,29,.4); cursor: pointer; overflow: hidden; }
.upload-box input { display: none; }
.upload-box img { width: 100%; height: 100%; object-fit: contain; }
.detection-box { position: absolute; display: flex; align-items: flex-start; justify-content: center; min-width: 64px; min-height: 34px; padding: 3px 6px; border: 2px solid #22d983; color: #fff; background: rgba(1, 22, 18, .35); font-size: 12px; text-shadow: 0 1px 2px rgba(0,0,0,.75); }
.result-list { display: grid; gap: 12px; }
.result-list article { padding: 14px; border-radius: 12px; background: rgba(3,16,29,.42); }
.result-list strong { display: block; color: #fff; margin-bottom: 4px; }
.error-text { color: #ff9ca5; margin-top: 10px; }
@media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr; } .page-head { flex-direction: column; align-items: stretch; } }
</style>
