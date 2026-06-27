<template>
  <div class="map-panel" :class="{ fullscreen: isFullscreen }">
    <div class="map-toolbar">
      <div class="map-title">作业地图</div>
      <div class="map-legend">
        <span><i class="done"></i>自绘路径</span>
        <span><i class="machine"></i>设备位置</span>
      </div>
    </div>

    <div class="map-image" :class="mapMode">
      <svg
        ref="svgRef"
        class="satellite-map"
        :class="mapMode"
        viewBox="0 0 1200 690"
        preserveAspectRatio="none"
        :style="{ transform: `scale(${zoomLevel})` }"
        @click="handleMapClick"
      >
        <defs>
          <linearGradient id="baseA" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#405332" />
            <stop offset=".45" stop-color="#1f3a2a" />
            <stop offset="1" stop-color="#314220" />
          </linearGradient>
          <linearGradient id="fieldA" x1="0" x2="1">
            <stop offset="0" stop-color="#0b7b54" stop-opacity=".64" />
            <stop offset=".5" stop-color="#109a62" stop-opacity=".58" />
            <stop offset="1" stop-color="#0a684d" stop-opacity=".62" />
          </linearGradient>
          <radialGradient id="satelliteShade" cx=".48" cy=".46" r=".75">
            <stop offset="0" stop-color="#030c14" stop-opacity=".04" />
            <stop offset=".58" stop-color="#030c14" stop-opacity=".18" />
            <stop offset="1" stop-color="#030c14" stop-opacity=".38" />
          </radialGradient>
          <pattern id="cropTexture" width="90" height="34" patternUnits="userSpaceOnUse">
            <path d="M-10 28 C22 8 54 38 100 14" fill="none" stroke="rgba(207,229,149,.12)" stroke-width="2" />
            <path d="M-8 16 C30 2 54 28 102 6" fill="none" stroke="rgba(22,49,28,.18)" stroke-width="2" />
          </pattern>
          <filter id="mapShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#00111f" flood-opacity=".62" />
          </filter>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="machineShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#00111f" flood-opacity=".72" />
          </filter>
        </defs>

        <g v-if="mapMode === 'satellite'" class="real-satellite-svg-layer">
          <image
            v-for="tile in satelliteTiles"
            :key="tile.key"
            :href="tile.url"
            :x="tile.x"
            :y="tile.y"
            :width="tile.width"
            :height="tile.height"
            preserveAspectRatio="xMidYMid slice"
          />
          <rect width="1200" height="690" class="satellite-shade" />
        </g>

        <g class="simulation-base">
          <rect width="1200" height="690" fill="url(#baseA)" />
          <path d="M0 80 C150 20 260 78 420 26 S750 70 1200 8 L1200 0 L0 0 Z" fill="#5b653c" opacity=".65" />
          <path d="M0 590 C180 520 360 566 540 500 S860 530 1200 440 L1200 690 L0 690 Z" fill="#1b2d20" opacity=".82" />
          <path d="M0 310 C160 250 280 280 430 224 S760 260 1200 160" stroke="#6a6a43" stroke-width="46" opacity=".42" />
          <path d="M-20 498 C160 438 314 460 500 392 S890 414 1220 310" stroke="#5b5f43" stroke-width="32" opacity=".42" />
          <path d="M90 140 L1034 92 L1120 500 L185 610 Z" fill="rgba(10,28,26,.72)" filter="url(#mapShadow)" />
        </g>

        <path
          v-if="hasCustomRoute"
          id="machineRoute"
          class="actual route-grounded"
          :d="machineRouteD"
        />
        <path v-else id="machineRoute" class="machine-route-hidden" d="M0 0" />
        <g v-if="manualDrawing || customWaypoints.length" class="route-waypoints">
          <polyline v-if="customWaypoints.length > 1" :points="waypointPolyline" />
          <circle
            v-for="(point, index) in customWaypoints"
            :key="`${point.x}-${point.y}-${index}`"
            :cx="point.x"
            :cy="point.y"
            r="8"
          />
        </g>
        <g class="machine-static harvester" transform="translate(558 368)">
          <ellipse cx="38" cy="49" rx="42" ry="9" fill="rgba(0, 13, 21, .35)" />
          <rect x="13" y="18" width="50" height="24" rx="6" fill="#d8e9c2" stroke="#082033" stroke-width="2" />
          <path d="M31 8 H53 L62 20 H26 Z" fill="#49a7ff" stroke="#082033" stroke-width="2" />
          <rect x="4" y="38" width="74" height="9" rx="4" fill="#d7c85d" stroke="#082033" stroke-width="2" />
          <rect x="64" y="24" width="16" height="15" rx="3" fill="#78b14c" stroke="#082033" stroke-width="2" />
          <circle cx="22" cy="47" r="7" fill="#061827" stroke="#c6d4df" stroke-width="2" />
          <circle cx="59" cy="47" r="7" fill="#061827" stroke="#c6d4df" stroke-width="2" />
          <circle cx="22" cy="47" r="3" fill="#4c6478" />
          <circle cx="59" cy="47" r="3" fill="#4c6478" />
        </g>

        <g v-if="hasCustomRoute" class="svg-machine-runner">
          <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
            <mpath href="#machineRoute" />
          </animateMotion>
          <g class="harvester moving-harvester" transform="translate(-40 -26)">
            <ellipse cx="40" cy="52" rx="43" ry="9" fill="rgba(0, 13, 21, .38)" />
            <path d="M12 22 H56 C66 22 73 29 73 38 V42 H12 Z" fill="#d8e9c2" stroke="#082033" stroke-width="2.2" />
            <path d="M30 8 H54 L65 22 H24 Z" fill="#49a7ff" stroke="#082033" stroke-width="2.2" />
            <path d="M35 12 H51 L57 20 H30 Z" fill="rgba(213, 241, 255, .85)" />
            <rect x="1" y="40" width="81" height="10" rx="5" fill="#d7c85d" stroke="#082033" stroke-width="2.2" />
            <path d="M72 28 H88 V45 H72 Z" fill="#79b04a" stroke="#082033" stroke-width="2.2" />
            <path d="M86 32 L101 27 V44 L86 41 Z" fill="#9cc94a" stroke="#082033" stroke-width="2" />
            <circle cx="23" cy="51" r="8" fill="#061827" stroke="#d0dbe5" stroke-width="2.2" />
            <circle cx="62" cy="51" r="8" fill="#061827" stroke="#d0dbe5" stroke-width="2.2" />
            <circle cx="23" cy="51" r="3.5" fill="#4c6478" />
            <circle cx="62" cy="51" r="3.5" fill="#4c6478" />
            <path class="dust" d="M-15 47 C-5 41 4 42 12 46" />
            <path class="dust second" d="M-25 55 C-10 49 0 51 11 56" />
          </g>
        </g>
      </svg>

      <div class="floating-card precision">
        <span>北斗定位精度</span>
        <strong>0.02 m</strong>
      </div>

      <div class="floating-card tooltip">
        <span>3号收割机</span>
        <strong>8.6 km/h</strong>
      </div>

      <div class="map-tools">
        <button type="button" :title="isFullscreen ? '退出全屏' : '全屏查看'" @click="toggleFullscreen">⛶</button>
        <button type="button" title="切换图层" @click="toggleMapMode">▣</button>
        <button type="button" title="回到设备位置" @click="focusMachine">◎</button>
        <button type="button" title="放大" @click="zoomIn">＋</button>
        <button type="button" title="缩小" @click="zoomOut">－</button>
      </div>

      <div class="map-scale">100 m</div>

      <div class="map-bottom">
        <span>地图模式</span>
        <button type="button" :class="{ active: mapMode === 'satellite' }" @click="mapMode = 'satellite'">卫星图</button>
        <button type="button" :class="{ active: mapMode === 'vector' }" @click="mapMode = 'vector'">矢量图</button>
        <button type="button" :class="{ active: customWaypoints.length > 0 }" @click="toggleTrack">作业轨迹</button>
        <button type="button" :class="{ active: manualDrawing }" @click="toggleManualDrawing">
          {{ manualDrawing ? '完成绘制' : '开始绘制' }}
        </button>
        <button type="button" @click="clearRoute">清除路径</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  showTrack: { type: Boolean, default: true }
})

const emit = defineEmits(['update:showTrack'])

const mapMode = ref('satellite')
const zoomLevel = ref(1)
const isFullscreen = ref(false)
const svgRef = ref(null)
const manualDrawing = ref(true)
const customWaypoints = ref([])
const satelliteCenter = { lat: 38.9708, lng: 106.4132 }
const satelliteZoom = 15

const satelliteTiles = computed(() => {
  const center = lngLatToTile(satelliteCenter.lng, satelliteCenter.lat, satelliteZoom)
  const tiles = []
  for (let row = -1; row <= 1; row += 1) {
    for (let col = -2; col <= 2; col += 1) {
      const x = center.x + col
      const y = center.y + row
      tiles.push({
        key: `${satelliteZoom}-${x}-${y}`,
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${satelliteZoom}/${y}/${x}`,
        x: 600 + col * 240 - 120,
        y: 345 + row * 230 - 115,
        width: 240,
        height: 230
      })
    }
  }
  return tiles
})

const hasCustomRoute = computed(() => customWaypoints.value.length > 1)
const machineRouteD = computed(() => hasCustomRoute.value ? pointsToPath(customWaypoints.value) : 'M0 0')

const waypointPolyline = computed(() => customWaypoints.value.map(point => `${point.x},${point.y}`).join(' '))

function lngLatToTile(lng, lat, zoom) {
  const n = 2 ** zoom
  const latRad = lat * Math.PI / 180
  return {
    x: Math.floor((lng + 180) / 360 * n),
    y: Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function toggleMapMode() {
  mapMode.value = mapMode.value === 'satellite' ? 'vector' : 'satellite'
}

function focusMachine() {
  zoomLevel.value = 1.08
  window.setTimeout(() => {
    zoomLevel.value = 1
  }, 900)
}

function zoomIn() {
  zoomLevel.value = Math.min(1.35, Math.round((zoomLevel.value + 0.08) * 100) / 100)
}

function zoomOut() {
  zoomLevel.value = Math.max(0.9, Math.round((zoomLevel.value - 0.08) * 100) / 100)
}

function toggleTrack() {
  emit('update:showTrack', !props.showTrack)
}

function toggleManualDrawing() {
  manualDrawing.value = !manualDrawing.value
  emit('update:showTrack', true)
}

function clearRoute() {
  manualDrawing.value = true
  customWaypoints.value = []
}

function handleMapClick(event) {
  if (!manualDrawing.value || !svgRef.value) return
  const point = clientToSvgPoint(event)
  customWaypoints.value.push(point)
  emit('update:showTrack', true)
}

function clientToSvgPoint(event) {
  const rect = svgRef.value.getBoundingClientRect()
  return {
    x: Math.round((event.clientX - rect.left) / rect.width * 1200),
    y: Math.round((event.clientY - rect.top) / rect.height * 690)
  }
}

function pointsToPath(points) {
  if (!points.length) return 'M0 0'
  const [first, ...rest] = points
  return `M${first.x} ${first.y} ${rest.map(point => `L${point.x} ${point.y}`).join(' ')}`
}

</script>

<style scoped>
.map-panel {
  width: 100%;
  height: 100%;
  min-height: 430px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 31, 51, 0.96), rgba(4, 18, 32, 0.96));
  border: 1px solid rgba(66, 137, 199, 0.35);
  border-radius: 4px;
}

.map-panel.fullscreen {
  position: fixed;
  inset: 12px;
  z-index: 1000;
  height: auto;
  min-height: 0;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .58);
}

.map-toolbar {
  min-height: 46px;
  height: auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(66, 137, 199, 0.24);
  flex-shrink: 0;
}

.map-title {
  color: #f4f9ff;
  font-size: 16px;
  font-weight: 700;
}

.map-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: #b9cce3;
  font-size: 12px;
}

.map-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.map-legend i {
  width: 20px;
  height: 4px;
  display: inline-block;
  border-radius: 999px;
}

.map-legend .done { background: #29dd72; }
.map-legend .machine { background: #e8f4d4; height: 10px; border: 1px solid #9cc94a; }

.map-image {
  position: relative;
  flex: 1;
  min-height: 360px;
  overflow: hidden;
  background: #0d2119;
}

.map-image.vector {
  filter: saturate(.72) contrast(1.08);
}

.satellite-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  transition: transform .28s ease, opacity .2s ease, filter .2s ease;
  transform-origin: center;
  z-index: 1;
}

.real-satellite-svg-layer image {
  filter: saturate(1.08) contrast(1.08) brightness(.92);
}

.satellite-shade {
  fill: url(#satelliteShade);
}

.satellite-map.satellite .simulation-base {
  opacity: 0;
}

.planned {
  fill: none;
  stroke: rgba(238, 203, 91, .58);
  stroke-width: 5;
  stroke-dasharray: 18 14;
  stroke-linecap: round;
  mix-blend-mode: multiply;
}

.actual {
  fill: none;
  stroke: rgba(120, 92, 44, .72);
  stroke-width: 14;
  stroke-linecap: round;
  stroke-dasharray: 1360;
  stroke-dashoffset: 1360;
  animation: drawRoute 7s linear infinite;
  filter: none;
  mix-blend-mode: multiply;
}

.actual::after {
  content: '';
}

.route-grounded {
  paint-order: stroke;
}

.machine-route-hidden {
  fill: none;
  stroke: transparent;
}

.satellite-map.satellite .planned {
  stroke: rgba(235, 207, 96, .46);
  mix-blend-mode: screen;
}

.satellite-map.satellite .actual {
  stroke: rgba(83, 62, 30, .72);
  mix-blend-mode: multiply;
}

.route-waypoints polyline {
  fill: none;
  stroke: rgba(245, 210, 83, .75);
  stroke-width: 4;
  stroke-dasharray: 12 10;
  stroke-linecap: round;
}

.route-waypoints circle {
  fill: #f5d253;
  stroke: #082033;
  stroke-width: 3;
  filter: url(#machineShadow);
}

.harvester {
  filter: url(#machineShadow);
}

.moving-harvester {
  transform-box: fill-box;
  transform-origin: center;
}

.moving-harvester circle {
  animation: wheelSpin .7s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.dust {
  fill: none;
  stroke: rgba(214, 201, 116, .55);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 18 12;
  animation: dustPulse 1.4s ease-in-out infinite;
}

.dust.second {
  animation-delay: .35s;
  opacity: .75;
}

.floating-card {
  position: absolute;
  z-index: 2;
  padding: 8px 12px;
  border-radius: 4px;
  background: rgba(5, 18, 31, 0.88);
  border: 1px solid rgba(66, 137, 199, 0.5);
  color: #b9cce3;
  font-size: 12px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}

.floating-card span,
.floating-card strong {
  display: block;
}

.floating-card strong {
  margin-top: 4px;
  color: #53c0ff;
  font-size: 16px;
}

.precision {
  right: 18px;
  top: 18px;
}

.tooltip {
  left: 49%;
  top: 40%;
}

.map-tools {
  position: absolute;
  right: 16px;
  top: 94px;
  display: grid;
  gap: 10px;
}

.map-tools button {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(66, 137, 199, 0.5);
  border-radius: 4px;
  background: rgba(5, 18, 31, 0.88);
  color: #dcecff;
  font-size: 20px;
  cursor: pointer;
}

.map-scale {
  position: absolute;
  right: 36px;
  bottom: 60px;
  padding: 5px 14px;
  border: 1px solid rgba(220, 236, 255, 0.65);
  color: #dcecff;
  background: rgba(5, 18, 31, 0.78);
}

.map-bottom {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 9px;
  border-radius: 4px;
  background: rgba(5, 18, 31, 0.72);
  color: #b9cce3;
  font-size: 13px;
}

.map-bottom button {
  height: 24px;
  padding: 0 12px;
  border: 1px solid rgba(66, 137, 199, 0.48);
  border-radius: 3px;
  background: rgba(14, 46, 75, 0.8);
  color: #b9cce3;
}

.map-bottom button.active {
  color: #ffffff;
  background: rgba(25, 126, 231, 0.55);
  border-color: rgba(45, 168, 255, .7);
}

.map-bottom input {
  vertical-align: -2px;
}

@media (max-width: 1500px) {
  .map-legend span:nth-child(4),
  .map-legend span:nth-child(5) {
    display: none;
  }

  .floating-card.tooltip {
    display: none;
  }

  .map-bottom {
    flex-wrap: wrap;
  }
}

@keyframes drawRoute {
  0% { stroke-dashoffset: 1360; }
  72%, 100% { stroke-dashoffset: 360; }
}

@keyframes wheelSpin {
  to { transform: rotate(360deg); }
}

@keyframes dustPulse {
  0% {
    opacity: 0;
    stroke-dashoffset: 24;
  }
  35% {
    opacity: .75;
  }
  100% {
    opacity: 0;
    stroke-dashoffset: -18;
  }
}
</style>
