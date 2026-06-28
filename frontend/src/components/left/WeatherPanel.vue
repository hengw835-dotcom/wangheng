<template>
  <DashboardCard title="瀹炴椂澶╂皵">
    <div class="weather-panel">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">鑾峰彇澶╂皵鏁版嵁涓?..</div>
      </div>
      <div v-else-if="error" class="error">
        <div class="error-icon">鈿狅笍</div>
        <div class="error-text">{{ error }}</div>
        <button class="retry-btn" @click="fetchWeatherData">閲嶈瘯</button>
      </div>
      <div v-else class="weather-content">
        <div class="weather-top">
          <div class="weather-main">
            <div class="weather-icon" :class="weatherIconClass">
              <svg v-if="weatherData.icon === 'clear'" viewBox="0 0 64 64" width="48" height="48">
                <circle cx="32" cy="32" r="12" fill="#ffd700" opacity="0.9"/>
                <g stroke="#ffd700" stroke-width="2" opacity="0.6">
                  <line x1="32" y1="4" x2="32" y2="14"/>
                  <line x1="32" y1="50" x2="32" y2="60"/>
                  <line x1="4" y1="32" x2="14" y2="32"/>
                  <line x1="50" y1="32" x2="60" y2="32"/>
                  <line x1="12" y1="12" x2="19" y2="19"/>
                  <line x1="45" y1="45" x2="52" y2="52"/>
                  <line x1="52" y1="12" x2="45" y2="19"/>
                  <line x1="19" y1="45" x2="12" y2="52"/>
                </g>
              </svg>
              <svg v-else-if="weatherData.icon === 'cloudy'" viewBox="0 0 64 64" width="48" height="48">
                <path d="M44 44 Q50 38 56 44 Q56 52 48 52 L28 52 Q20 52 20 44 Q20 36 28 36 Q30 28 40 30 Q48 28 48 36 Q52 36 52 40" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>
              </svg>
              <svg v-else-if="weatherData.icon === 'rainy'" viewBox="0 0 64 64" width="48" height="48">
                <path d="M44 44 Q50 38 56 44 Q56 52 48 52 L28 52 Q20 52 20 44 Q20 36 28 36 Q30 28 40 30 Q48 28 48 36 Q52 36 52 40" fill="rgba(100,149,237,0.5)" stroke="rgba(100,149,237,0.7)" stroke-width="1"/>
                <g stroke="rgba(100,149,237,0.7)" stroke-width="2">
                  <line x1="28" y1="52" x2="24" y2="60"/>
                  <line x1="36" y1="52" x2="32" y2="60"/>
                  <line x1="44" y1="52" x2="40" y2="60"/>
                </g>
              </svg>
              <svg v-else viewBox="0 0 64 64" width="48" height="48">
                <circle cx="32" cy="32" r="12" fill="#ffd700" opacity="0.9"/>
                <g stroke="#ffd700" stroke-width="2" opacity="0.6">
                  <line x1="32" y1="4" x2="32" y2="14"/>
                  <line x1="32" y1="50" x2="32" y2="60"/>
                  <line x1="4" y1="32" x2="14" y2="32"/>
                  <line x1="50" y1="32" x2="60" y2="32"/>
                  <line x1="12" y1="12" x2="19" y2="19"/>
                  <line x1="45" y1="45" x2="52" y2="52"/>
                  <line x1="52" y1="12" x2="45" y2="19"/>
                  <line x1="19" y1="45" x2="12" y2="52"/>
                </g>
                <path d="M44 44 Q50 38 56 44 Q56 52 48 52 L28 52 Q20 52 20 44 Q20 36 28 36 Q30 28 40 30 Q48 28 48 36 Q52 36 52 40" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
              </svg>
            </div>
            <div class="temp-display">
              <span class="temp-value">{{ weatherData.temperature }}</span>
              <span class="temp-unit">&deg;</span>
            </div>
            <div class="weather-desc">{{ weatherData.desc }}</div>
          </div>
          <div class="time-display">
            <div class="time-main">{{ timeStr }}</div>
            <div class="time-date">{{ dateStr }}</div>
          </div>
        </div>
        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-icon">&#x2601;</span>
            <span class="detail-label">{{ weatherData.cloud }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">&#x1F4A7;</span>
            <span class="detail-label">{{ weatherData.humidity }}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">&#x1F32C;</span>
            <span class="detail-label">{{ weatherData.windSpeed }}m/s</span>
          </div>
        </div>
        <div class="weather-bottom">
          <div class="bottom-item">
            <span class="bottom-label">浣滀笟鍖哄煙</span>
            <span class="bottom-value">{{ weatherData.location }}</span>
          </div>
          <div class="bottom-item">
            <span class="bottom-label">浣撴劅娓╁害</span>
            <span class="bottom-value">{{ weatherData.feelsLike }}&deg;C</span>
          </div>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import DashboardCard from '../common/DashboardCard.vue'

const timeStr = ref('')
const dateStr = ref('')
let timer = null

const loading = ref(false) // 鍒濆璁剧疆涓篺alse锛岀洿鎺ユ樉绀洪粯璁ゆ暟鎹?const error = ref('')
const weatherData = ref({
  temperature: 0,
  desc: '鏃犳暟鎹?,
  cloud: '鏃犳暟鎹?,
  humidity: 0,
  windSpeed: 0,
  feelsLike: 0,
  location: '鏃犳暟鎹?,
  icon: 'clear'
})

const weatherIconClass = computed(() => {
  return `weather-icon-${weatherData.value.icon}`
})

function updateTime() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  timeStr.value = `${h}:${m}`
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['鏃?, '涓€', '浜?, '涓?, '鍥?, '浜?, '鍏?]
  dateStr.value = `${month}/${day} 鍛?{weekDays[now.getDay()]}`
}

function getWeatherIcon(condition) {
  const lowerCondition = condition.toLowerCase()
  if (lowerCondition.includes('clear')) {
    return 'clear'
  } else if (lowerCondition.includes('cloud')) {
    return 'cloudy'
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return 'rainy'
  } else {
    return 'clear'
  }
}

async function fetchWeatherData(lat, lon) {
  loading.value = true
  error.value = ''
  
  try {
    
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || ''
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=zh_cn&appid=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`API璇锋眰澶辫触: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 澶勭悊澶╂皵鏁版嵁
    weatherData.value = {
      temperature: Math.round(data.main.temp),
      desc: data.weather[0].description,
      cloud: `${data.clouds.all}%`,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
      location: '瀹佸鐞嗗伐瀛﹂櫌',
      icon: getWeatherIcon(data.weather[0].main)
    }
  } catch (err) {
    console.error('鑾峰彇澶╂皵鏁版嵁澶辫触:', err)
    // 澶辫触鏃朵娇鐢ㄩ粯璁ょ殑妯℃嫙鏁版嵁
    weatherData.value = {
      temperature: 22,
      desc: '澶氫簯杞櫞',
      cloud: '30%',
      humidity: 65,
      windSpeed: 3.5,
      feelsLike: 24,
      location: '瀹佸鐞嗗伐瀛﹂櫌',
      icon: 'clear'
    }
  } finally {
    loading.value = false
  }
}

function getCurrentLocation() {
  fetchWeatherData(38.9702, 106.4141)
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  
  // 鑾峰彇澶╂皵鏁版嵁
  getCurrentLocation()
  
  // 姣?0鍒嗛挓鏇存柊涓€娆″ぉ姘旀暟鎹?  setInterval(() => {
    getCurrentLocation()
  }, 30 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.weather-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px;
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.weather-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.weather-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weather-icon {
  margin-bottom: 2px;
  transition: transform 0.3s ease;
}

.weather-icon:hover {
  transform: scale(1.1);
}

.temp-display {
  display: flex;
  align-items: flex-start;
}

.temp-value {
  font-size: 42px;
  font-weight: 300;
  line-height: 1;
  color: var(--text-primary);
}

.temp-unit {
  font-size: 20px;
  margin-top: 4px;
  color: var(--text-secondary);
}

.weather-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.time-display {
  text-align: right;
}

.time-main {
  font-size: 36px;
  font-weight: 300;
  font-family: var(--font-digital);
  color: var(--text-primary);
  line-height: 1;
}

.time-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.weather-details {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid var(--border-card);
  border-bottom: 1px solid var(--border-card);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.detail-item:hover {
  color: var(--color-cyan);
}

.detail-icon {
  font-size: 14px;
}

.weather-bottom {
  display: flex;
  justify-content: space-between;
}

.bottom-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bottom-label {
  font-size: 11px;
  color: var(--text-muted);
}

.bottom-value {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 鍔犺浇鐘舵€?*/
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 10px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top: 3px solid var(--color-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 閿欒鐘舵€?*/
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 10px;
  text-align: center;
  padding: 0 20px;
}

.error-icon {
  font-size: 32px;
}

.error-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.retry-btn {
  margin-top: 10px;
  padding: 6px 12px;
  background: var(--color-cyan);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-blue);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
}

/* 澶╂皵鍥炬爣鍔ㄧ敾 */
.weather-icon-clear {
  animation: pulse 2s infinite;
}

.weather-icon-cloudy {
  animation: float 3s ease-in-out infinite;
}

.weather-icon-rainy {
  animation: rain 1s linear infinite;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

@keyframes rain {
  0% { transform: translateY(0); }
  100% { transform: translateY(5px); }
}
</style>


