<template>
  <DashboardCard title="土壤状态 5cm">
    <div class="soil-panel">
      <div class="soil-visual">
        <div class="soil-section">
          <div class="soil-layer" style="background: linear-gradient(180deg, #3a2a1a, #2a1a0a); height: 25%;">
            <span class="layer-label">表土层</span>
          </div>
          <div class="soil-layer" style="background: linear-gradient(180deg, #4a3a2a, #3a2a1a); height: 30%;">
            <span class="layer-label">耕作层</span>
          </div>
          <div class="soil-layer" style="background: linear-gradient(180deg, #5a4a3a, #4a3a2a); height: 25%;">
            <span class="layer-label">心土层</span>
          </div>
          <div class="soil-layer" style="background: linear-gradient(180deg, #6a5a4a, #5a4a3a); height: 20%;">
            <span class="layer-label">底土层</span>
          </div>
        </div>
        <div class="soil-roots">
          <svg viewBox="0 0 60 120" width="60" height="100%">
            <path d="M30 0 Q25 30 20 60 Q18 80 22 100" stroke="#2d5a1e" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M30 0 Q35 40 28 70 Q26 90 30 110" stroke="#2d5a1e" stroke-width="1" fill="none" opacity="0.4"/>
            <path d="M30 0 Q38 25 40 50 Q42 70 35 90" stroke="#2d5a1e" stroke-width="1" fill="none" opacity="0.3"/>
            <circle cx="30" cy="0" r="8" fill="#3a6b2a" opacity="0.6"/>
          </svg>
        </div>
      </div>
      <div class="soil-params">
        <div class="param-item">
          <span class="param-icon">💧</span>
          <span class="param-label">含水量(ml/kg)</span>
          <span class="param-value">{{ soilData.moisture }}</span>
        </div>
        <div class="param-item">
          <span class="param-icon">🧪</span>
          <span class="param-label">养分(%)</span>
          <span class="param-value">{{ soilData.nutrient }}</span>
        </div>
        <div class="param-item">
          <span class="param-icon">📊</span>
          <span class="param-label">pH值</span>
          <span class="param-value">{{ soilData.ph }}</span>
        </div>
        <div class="param-item highlight">
          <span class="param-icon">🌿</span>
          <span class="param-label">N (mg/kg)</span>
          <span class="param-value">{{ soilData.nitrogen }}</span>
        </div>
        <div class="param-item">
          <span class="param-icon">🔬</span>
          <span class="param-label">P (mg/kg)</span>
          <span class="param-value">{{ soilData.phosphorus }}</span>
        </div>
        <div class="param-item">
          <span class="param-icon">⚗️</span>
          <span class="param-label">K (mg/kg)</span>
          <span class="param-value">{{ soilData.potassium }}</span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup>
import { ref } from 'vue'
import DashboardCard from '../common/DashboardCard.vue'

const soilData = ref({
  moisture: 0,
  nutrient: 0,
  ph: 0,
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0
})
</script>

<style scoped>
.soil-panel {
  display: flex;
  gap: 12px;
}

.soil-visual {
  width: 80px;
  height: 160px;
  position: relative;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-card);
}

.soil-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.soil-layer {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.layer-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

.soil-roots {
  position: absolute;
  top: 0;
  left: 10px;
  width: 60px;
  height: 100%;
  pointer-events: none;
}

.soil-params {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.param-icon {
  font-size: 13px;
  width: 18px;
  text-align: center;
}

.param-label {
  flex: 1;
  color: var(--text-secondary);
  font-size: 11px;
}

.param-value {
  color: var(--color-cyan);
  font-family: var(--font-digital);
  font-size: 13px;
  font-weight: 600;
}

.param-item.highlight .param-value {
  color: var(--color-green);
}
</style>
