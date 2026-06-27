<template>
  <div class="page-root">
    <TopNavBar />

    <main class="workspace">
      <section class="page-head">
        <div>
          <span class="eyebrow">AI VISION</span>
          <h1>视觉识别</h1>
          <p>上传田间或农机图片，调用后端 `/ai-vision/detect` 接口返回识别结果。</p>
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
        title="当前后端视觉识别仍是演示模式，返回结果不能作为真实模型精度依据。"
      />

      <section class="content-grid">
        <article class="panel upload-panel">
          <header>
            <h2>图片识别</h2>
            <el-button type="primary" :loading="loading" :disabled="!selectedFile" @click="detect">开始识别</el-button>
          </header>

          <label class="upload-box">
            <input type="file" accept="image/*" @change="selectFile" />
            <template v-if="previewUrl">
              <img :src="previewUrl" alt="待识别图片" />
            </template>
            <template v-else>
              <strong>选择图片</strong>
              <span>支持 jpg、png、webp，用于调用后端识别接口</span>
            </template>
          </label>
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

        <article class="panel note-panel">
          <header><h2>真实落地要求</h2></header>
          <ul>
            <li>接入真实模型：YOLOv8/RT-DETR/自训练作物与障碍物检测模型。</li>
            <li>后端推理服务需要返回模型版本、置信度、类别、框坐标和处理耗时。</li>
            <li>生产环境需要保存识别记录，便于追溯图片、设备和任务。</li>
            <li>当前页面已经预留真实接口调用，不再展示前端伪造识别目标。</li>
          </ul>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import TopNavBar from '../components/layout/TopNavBar.vue'
import { useSystemStore } from '../store'

const systemStore = useSystemStore()
const selectedFile = ref(null)
const previewUrl = ref('')
const results = ref([])
const loading = ref(false)

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
  const file = event.target.files?.[0]
  selectedFile.value = file || null
  results.value = []
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file ? URL.createObjectURL(file) : ''
}

async function detect() {
  if (!selectedFile.value) return
  loading.value = true
  try {
    const body = new FormData()
    body.append('image', selectedFile.value)
    const { data } = await axios.post('/api/ai-vision/detect', body)
    results.value = Array.isArray(data) ? data : []
    ElMessage.success('识别请求已完成')
  } finally {
    loading.value = false
  }
}

function readableLabel(label) {
  const text = String(label || '')
  if (text.includes('浣滅墿')) return '作物'
  if (text.includes('闅')) return '障碍物'
  return text || '未知目标'
}

onMounted(() => systemStore.checkHealth())
</script>

<style scoped>
.page-root { height: 100%; background: var(--app-page-bg); }
.workspace { height: calc(100% - 72px); overflow: auto; padding: 22px; }
.page-head, .panel header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-head { margin-bottom: 16px; }
.eyebrow { color: #36c2ff; font-size: 12px; letter-spacing: .16em; }
h1 { margin-top: 8px; color: #fff; font-size: 34px; }
p, span, small, li { color: var(--app-text-muted); }
.mode-card { min-width: 220px; padding: 14px; border: 1px solid rgba(255,211,122,.35); border-radius: 14px; background: rgba(255,211,122,.08); }
.mode-card.real { border-color: rgba(34,217,131,.35); background: rgba(34,217,131,.08); }
.mode-card strong, .panel h2 { display: block; color: #fff; }
.mode-alert { margin-bottom: 16px; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, .8fr); gap: 16px; }
.panel { padding: 18px; border: 1px solid var(--app-panel-border); border-radius: 16px; background: var(--app-panel-bg); }
.note-panel { grid-column: 1 / -1; }
.upload-box { min-height: 420px; display: grid; place-items: center; gap: 10px; text-align: center; border: 1px dashed rgba(66,137,199,.42); border-radius: 14px; background: rgba(3,16,29,.4); cursor: pointer; overflow: hidden; }
.upload-box input { display: none; }
.upload-box img { width: 100%; height: 100%; object-fit: contain; }
.result-list { display: grid; gap: 12px; }
.result-list article { padding: 14px; border-radius: 12px; background: rgba(3,16,29,.42); }
.result-list strong { display: block; color: #fff; margin-bottom: 4px; }
.note-panel ul { display: grid; gap: 10px; padding-left: 18px; line-height: 1.7; }
@media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr; } .page-head { flex-direction: column; align-items: stretch; } }
</style>
