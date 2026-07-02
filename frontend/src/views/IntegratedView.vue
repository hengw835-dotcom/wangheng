<template>
  <div class="integrated-view yh-cockpit">
    <!-- 椤堕儴瀵艰埅鏍?-->
    <div class="top-nav">
      <div class="nav-left">
        <h1 class="system-name">鏅鸿兘鍐滄満绯荤粺</h1>
        <div class="nav-indicators">
          <span class="indicator"></span>
          <span class="indicator"></span>
          <span class="indicator"></span>
          <span class="indicator"></span>
          <span class="indicator"></span>
        </div>
      </div>
      <div class="nav-center">
        <el-menu :default-active="activeNav" class="nav-menu" mode="horizontal">
          <el-menu-item index="home">棣栭〉</el-menu-item>
          <el-menu-item index="intelligent-breeding">鏅烘収鍏绘畺</el-menu-item>
        </el-menu>
      </div>
      <div class="nav-right">
        <div class="nav-info">
          <span class="date-time">{{ currentDateTime }}</span>
          <span class="weather">澶╂皵锛氫粖澶?0掳C-10掳C</span>
        </div>
        <el-button type="primary" class="user-button">
          <i class="el-icon-user"></i>
        </el-button>
      </div>
    </div>



    <!-- 鍔熻兘鏍囩椤?-->
    <div class="tabs-container">
      <el-tabs v-model="activeTab" class="scifi-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="绯荤粺姒傝" name="overview" class="tab-pane">
          <!-- 绯荤粺姒傝鍐呭 -->
          <div class="overview-section">
            <div class="section-title">
              <span>绯荤粺姒傝</span>
            </div>
            <div class="overview-stats">
              <div class="stat-card">
                <div class="stat-icon">馃殰</div>
                <el-statistic :value="onlineMachines" suffix="台" class="stat-value">
                  <template #title>
                    <span class="stat-title">鍦ㄧ嚎鍐滄満</span>
                  </template>
                </el-statistic>
              </div>
              <div class="stat-card">
                <div class="stat-icon">馃搵</div>
                <el-statistic :value="activeTasks" suffix="个" class="stat-value">
                  <template #title>
                    <span class="stat-title">娲昏穬浠诲姟</span>
                  </template>
                </el-statistic>
              </div>
              <div class="stat-card">
                <div class="stat-icon">馃尵</div>
                <el-statistic :value="todayHarvest" suffix="亩" class="stat-value">
                  <template #title>
                    <span class="stat-title">浠婃棩鏀跺壊闈㈢Н</span>
                  </template>
                </el-statistic>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⚖</div>
                <el-statistic :value="estimatedYield" suffix="吨" class="stat-value">
                  <template #title>
                    <span class="stat-title">棰勪及浜ч噺</span>
                  </template>
                </el-statistic>
              </div>
            </div>
            
            <!-- 鍥捐〃鍖哄煙 -->
            <div class="charts-section">
              <div class="section-title">
                <span>鏁版嵁鍙鍖</span>
              </div>
              <el-row :gutter="30">
                <el-col :span="12">
                  <div class="chart-card">
                    <div class="chart-header">
                      <span>鏀跺壊杩涘害</span>
                    </div>
                    <div ref="progressChart" class="chart"></div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="chart-card">
                    <div class="chart-header">
                      <span>浜ч噺鍒嗗竷</span>
                    </div>
                    <div ref="yieldChart" class="chart"></div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 鏈€杩戜换鍔?-->
            <div class="tasks-section">
              <div class="section-title">
                <span>鏈€杩戜换鍔</span>
              </div>
              <div class="tasks-card">
                <el-table :data="recentTasks" class="tasks-table">
                  <el-table-column prop="taskId" label="浠诲姟ID" width="180">
                    <template #default="scope">
                      <span class="table-cell">{{ scope.row.taskId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="fieldName" label="鍦板潡鍚嶇О">
                    <template #default="scope">
                      <span class="table-cell">{{ scope.row.fieldName }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="machineId" label="鍐滄満ID" width="120">
                    <template #default="scope">
                      <span class="table-cell">{{ scope.row.machineId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="120">
                    <template #default="scope">
                      <el-tag :class="['status-tag', `status-${scope.row.status.toLowerCase()}`]">{{ scope.row.status }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="completedArea" label="完成面积(亩)" width="140">
                    <template #default="scope">
                      <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: `${(scope.row.completedArea / 100) * 100}%` }"></div>
                        <span class="progress-text">{{ scope.row.completedArea }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="鍐滄満绠＄悊" name="machines" class="tab-pane">
          <!-- 鍐滄満绠＄悊鍐呭 -->
          <div class="machine-management">
            <div class="section-title">
              <span>鍐滄満绠＄悊</span>
            </div>
            <div class="machines-card">
              <div class="card-header">
                <span>鍐滄満鍒楄〃</span>
                <el-button type="primary" @click="openAddMachineDialog" class="scifi-button">娣诲姞鍐滄満</el-button>
              </div>
              <el-table :data="machines" class="scifi-table">
                <el-table-column prop="machineId" label="鍐滄満ID" width="180">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.machineId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="model" label="鍨嬪彿">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.model }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :class="['status-tag', `status-${scope.row.status.toLowerCase()}`]">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="location" label="浣嶇疆">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.location }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="lastUpdated" label="最后更新" width="180">
                  <template #default="scope">
                    <span class="table-cell">{{ formatDate(scope.row.lastUpdated) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="鎿嶄綔" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="editMachine(scope.row)" class="scifi-button">缂栬緫</el-button>
                    <el-button size="small" type="danger" @click="deleteMachine(scope.row.machineId)" class="scifi-button danger">鍒犻櫎</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="浠诲姟绠＄悊" name="tasks" class="tab-pane">
          <!-- 浠诲姟绠＄悊鍐呭 -->
          <div class="task-management">
            <div class="section-title">
              <span>浠诲姟绠＄悊</span>
            </div>
            <div class="tasks-card">
              <div class="card-header">
                <span>浠诲姟鍒楄〃</span>
                <el-button type="primary" @click="openAddTaskDialog" class="scifi-button">鍒涘缓浠诲姟</el-button>
              </div>
              <el-table :data="tasks" class="scifi-table">
                <el-table-column prop="taskId" label="浠诲姟ID" width="180">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.taskId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="fieldName" label="鍦板潡鍚嶇О">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.fieldName }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="machineId" label="鍐滄満ID" width="120">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.machineId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :class="['status-tag', `status-${scope.row.status.toLowerCase()}`]">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="targetArea" label="目标面积(亩)" width="120">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.targetArea }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="completedArea" label="完成面积(亩)" width="120">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.completedArea }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="estimatedYield" label="预计产量(吨)" width="120">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.estimatedYield }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="startTime" label="开始时间" width="180">
                  <template #default="scope">
                    <span class="table-cell">{{ formatDate(scope.row.startTime) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="鎿嶄綔" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="updateTaskStatus(scope.row.taskId, 'IN_PROGRESS')" v-if="scope.row.status === 'PENDING'" class="scifi-button">寮€濮</el-button>
                    <el-button size="small" @click="updateTaskStatus(scope.row.taskId, 'COMPLETED')" v-if="scope.row.status === 'IN_PROGRESS'" class="scifi-button success">瀹屾垚</el-button>
                    <el-button size="small" type="danger" @click="deleteTask(scope.row.taskId)" class="scifi-button danger">鍒犻櫎</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="传感器数据" name="sensor-data" class="tab-pane">
          <!-- 浼犳劅鍣ㄦ暟鎹唴瀹?-->
          <div class="sensor-data">
            <div class="section-title">
              <span>浼犳劅鍣ㄦ暟鎹</span>
            </div>
            <div class="sensor-card">
              <div class="card-header">
                <span>浼犳劅鍣ㄦ暟鎹</span>
                <el-select v-model="selectedMachineId" placeholder="閫夋嫨鍐滄満" class="scifi-select">
                  <el-option v-for="machine in machines" :key="machine.machineId" :label="machine.machineId" :value="machine.machineId" />
                </el-select>
              </div>
              <div class="sensor-charts">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="chart-card">
                      <div class="chart-header">
                        <span>閫熷害鏁版嵁</span>
                      </div>
                      <div ref="speedChart" class="chart"></div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="chart-card">
                      <div class="chart-header">
                        <span>娓╁害鏁版嵁</span>
                      </div>
                      <div ref="temperatureChart" class="chart"></div>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" style="margin-top: 20px;">
                  <el-col :span="12">
                    <div class="chart-card">
                      <div class="chart-header">
                        <span>婀垮害鏁版嵁</span>
                      </div>
                      <div ref="humidityChart" class="chart"></div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="chart-card">
                      <div class="chart-header">
                        <span>鍘嬪姏鏁版嵁</span>
                      </div>
                      <div ref="pressureChart" class="chart"></div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <el-table :data="sensorData" class="scifi-table" style="margin-top: 20px;">
                <el-table-column prop="sensorType" label="传感器类型" width="120">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.sensorType }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="数值">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.value }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="unit" label="鍗曚綅" width="80">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.unit }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="timestamp" label="鏃堕棿" width="180">
                  <template #default="scope">
                    <span class="table-cell">{{ formatDate(scope.row.timestamp) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="location" label="浣嶇疆">
                  <template #default="scope">
                    <span class="table-cell">{{ scope.row.location }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="AI瑙嗚璇嗗埆" name="ai-vision" class="tab-pane">
          <!-- AI瑙嗚璇嗗埆鍐呭 -->
          <div class="ai-vision">
            <div class="section-title">
              <span>AI瑙嗚璇嗗埆</span>
            </div>
            <div class="vision-card">
              <div class="card-header">
                <span>AI瑙嗚璇嗗埆</span>
                <el-button type="primary" @click="startRecognition" class="scifi-button">寮€濮嬭瘑鍒</el-button>
              </div>
              <div class="vision-content">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="vision-sub-card">
                      <div class="chart-header">
                        <span>瀹炴椂棰勮</span>
                      </div>
                      <div class="preview-container">
                        <img ref="previewImage" :src="previewImageSrc" alt="瀹炴椂棰勮" class="preview-image" />
                        <div v-if="detections.length > 0" class="detection-overlay">
                          <div v-for="(detection, index) in detections" :key="index" class="detection-box" :style="getDetectionStyle(detection)">
                            <span class="detection-label">{{ detection.label }} {{ detection.confidence.toFixed(2) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="vision-sub-card">
                      <div class="chart-header">
                        <span>璇嗗埆缁撴灉</span>
                      </div>
                      <div class="detection-results">
                        <el-table :data="detections" class="scifi-table">
                          <el-table-column prop="label" label="鐩爣" width="100">
                            <template #default="scope">
                              <span class="table-cell">{{ scope.row.label }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="confidence" label="置信度" width="100">
                            <template #default="scope">
                              <span class="table-cell">{{ (scope.row.confidence * 100).toFixed(1) }}%</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="x" label="X鍧愭爣" width="80">
                            <template #default="scope">
                              <span class="table-cell">{{ scope.row.x }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="y" label="Y鍧愭爣" width="80">
                            <template #default="scope">
                              <span class="table-cell">{{ scope.row.y }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="width" label="瀹藉害" width="80">
                            <template #default="scope">
                              <span class="table-cell">{{ scope.row.width }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="height" label="楂樺害" width="80">
                            <template #default="scope">
                              <span class="table-cell">{{ scope.row.height }}</span>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                      <div class="stats-card" style="margin-top: 20px;">
                        <div class="chart-header">
                          <span>缁熻淇℃伅</span>
                        </div>
                        <div class="stats-content">
                          <el-statistic class="stat-item" title="检测目标数" :value="detections.length"></el-statistic>
                          <el-statistic class="stat-item" title="平均置信度" :value="averageConfidence" suffix="%"></el-statistic>
                          <el-statistic class="stat-item" title="澶勭悊鏃堕棿" :value="processingTime" suffix="ms"></el-statistic>
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" style="margin-top: 20px;">
                  <el-col :span="24">
                    <div class="heatmap-card">
                      <div class="chart-header">
                        <span>浜ч噺鍒嗗竷鐑姏鍥</span>
                      </div>
                      <div ref="heatmapChart" class="heatmap"></div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="鍖楁枟鍗槦瀵艰埅" name="beidou-navigation" class="tab-pane">
          <!-- 鍖楁枟鍗槦鏅鸿兘瑙勫垝璺嚎妯″潡鍐呭 -->
          <div class="beidou-navigation">
            <div class="section-title">
              <span>鍖楁枟鍗槦鏅鸿兘瑙勫垝璺嚎</span>
            </div>
            <div class="beidou-card">
              <div class="card-header">
                <span>鍗槦瀵艰埅绯荤粺</span>
                <el-select v-model="selectedMachineId" placeholder="閫夋嫨鍐滄満" class="scifi-select">
                  <el-option v-for="machine in machines" :key="machine.machineId" :label="machine.machineId" :value="machine.machineId" />
                </el-select>
              </div>
              <div class="beidou-content">
                <el-row :gutter="20">
                  <el-col :span="16">
                    <div class="map-card">
                      <div class="chart-header">
                        <span>鍦板浘鏄剧ず</span>
                      </div>
                      <div ref="beidouMap" class="map-container">
                        <!-- 鍔犺浇涓姸鎬?-->
                        <div v-if="!mapUrl" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(10, 10, 30, 0.6); border-radius: 8px; border: 1px solid rgba(0, 255, 255, 0.3);">
                          <div style="text-align: center; color: #00ffff;">
                            <div style="font-size: 24px; margin-bottom: 10px;">馃椇锔</div>
                            <div>鍖楁枟鍗槦鍦板浘</div>
                            <div style="margin-top: 10px; font-size: 14px; color: rgba(255, 255, 255, 0.7);">姝ｅ湪鑾峰彇褰撳墠浣嶇疆...</div>
                          </div>
                        </div>
                        
                        <!-- 鍦板浘鏄剧ず -->
                        <img 
                          v-else
                          :src="mapUrl" 
                          alt="鍖楁枟鍗槦鍦板浘" 
                          style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                        />
                        
                        <!-- 璺嚎鏍囨敞 -->
                        <div style="position: absolute; top: 10px; left: 10px; color: #00aaff; font-size: 12px; z-index: 10; background: rgba(10, 10, 30, 0.7); padding: 5px 10px; border-radius: 4px;">
                          鍖楁枟鍗槦瑕嗙洊鍖哄煙
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="route-planning-card">
                      <div class="chart-header">
                        <span>璺嚎瑙勫垝</span>
                      </div>
                      <div class="planning-content">
                        <el-form :model="routeForm" label-width="80px">
                          <el-form-item label="璧风偣">
                            <el-input v-model="routeForm.startPoint" placeholder="杈撳叆璧风偣鍧愭爣" class="scifi-input" />
                          </el-form-item>
                          <el-form-item label="缁堢偣">
                            <el-input v-model="routeForm.endPoint" placeholder="杈撳叆缁堢偣鍧愭爣" class="scifi-input" />
                          </el-form-item>
                          <el-form-item label="瑙勫垝妯″紡">
                            <el-select v-model="routeForm.planningMode" class="scifi-select">
                              <el-option label="最短路径" value="shortest" />
                              <el-option label="最优路径" value="optimal" />
                              <el-option label="閬块殰璺緞" value="obstacle" />
                            </el-select>
                          </el-form-item>
                          <el-form-item label="琛岄┒閫熷害">
                            <el-slider v-model="routeForm.speed" :min="0" :max="20" :step="0.5" show-input class="scifi-slider" />
                          </el-form-item>
                          <el-form-item>
                            <el-button type="primary" @click="planRoute" class="scifi-button">瑙勫垝璺嚎</el-button>
                            <el-button @click="startNavigation" class="scifi-button">寮€濮嬪鑸</el-button>
                          </el-form-item>
                        </el-form>
                      </div>
                    </div>
                    <div class="satellite-status-card" style="margin-top: 20px;">
                      <div class="chart-header">
                        <span>鍗槦鐘舵€</span>
                      </div>
                      <div class="satellite-content">
                        <el-row :gutter="10">
                          <el-col :span="12">
                            <el-statistic title="鍗槦鏁伴噺" :value="satelliteCount" class="stat-item"></el-statistic>
                          </el-col>
                          <el-col :span="12">
                            <el-statistic title="瀹氫綅绮惧害" :value="positionAccuracy" suffix="m" class="stat-item"></el-statistic>
                          </el-col>
                        </el-row>
                        <div class="satellite-list" style="margin-top: 10px;">
                          <div v-for="(satellite, index) in satellites" :key="index" class="satellite-item">
                            <span class="satellite-id">鍗槦 {{ satellite.id }}</span>
                            <span class="satellite-signal" :class="{ 'strong': satellite.signal > 30, 'weak': satellite.signal <= 30 }">
                              {{ satellite.signal }}dB
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
                <div class="route-info" style="margin-top: 20px;">
                  <div class="chart-header">
                    <span>璺嚎淇℃伅</span>
                  </div>
                  <el-table :data="routeInfo" class="scifi-table">
                    <el-table-column prop="key" label="椤圭洰" width="120">
                      <template #default="scope">
                        <span class="table-cell">{{ scope.row.key }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="value" label="数值">
                      <template #default="scope">
                        <span class="table-cell">{{ scope.row.value }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="鎺у埗绯荤粺" name="control-system" class="tab-pane">
          <!-- 鎺у埗绯荤粺鍐呭 -->
          <div class="control-system">
            <div class="section-title">
              <span>鎺у埗绯荤粺</span>
              <div class="title-line"></div>
            </div>
            <div class="control-card">
              <div class="card-header">
                <span>鎺у埗绯荤粺</span>
                <el-select v-model="selectedMachineId" placeholder="閫夋嫨鍐滄満" class="scifi-select">
                  <el-option v-for="machine in machines" :key="machine.machineId" :label="machine.machineId" :value="machine.machineId" />
                </el-select>
              </div>
              <div class="control-content">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="control-sub-card">
                      <div class="chart-header">
                        <span>瀹炴椂鐘舵€</span>
                        <div class="header-glow"></div>
                      </div>
                      <div class="status-content">
                        <el-row :gutter="10">
                          <el-col :span="12">
                            <el-statistic title="閫熷害" :value="speed" suffix="km/h" class="stat-item"></el-statistic>
                          </el-col>
                          <el-col :span="12">
                            <el-statistic title="转速" :value="rpm" suffix="rpm" class="stat-item"></el-statistic>
                          </el-col>
                        </el-row>
                        <el-row :gutter="10" style="margin-top: 20px;">
                          <el-col :span="12">
                            <el-statistic title="温度" :value="temperature" suffix="℃" class="stat-item"></el-statistic>
                          </el-col>
                          <el-col :span="12">
                            <el-statistic title="鍘嬪姏" :value="pressure" suffix="bar" class="stat-item"></el-statistic>
                          </el-col>
                        </el-row>
                        <el-row :gutter="10" style="margin-top: 20px;">
                          <el-col :span="12">
                            <el-statistic title="濮挎€佽" :value="attitudeAngle" suffix="掳" class="stat-item"></el-statistic>
                          </el-col>
                          <el-col :span="12">
                            <el-statistic title="浣嶇疆绮惧害" :value="positionAccuracy" suffix="m" class="stat-item"></el-statistic>
                          </el-col>
                        </el-row>
                      </div>
                      <div class="card-glow"></div>
                    </div>
                    <div class="control-sub-card" style="margin-top: 20px;">
                      <div class="chart-header">
                        <span>鎺у埗鍙傛暟</span>
                        <div class="header-glow"></div>
                      </div>
                      <div class="control-params">
                        <el-form :model="controlParams" label-width="80px">
                          <el-form-item label="鐩爣閫熷害">
                            <el-slider v-model="controlParams.targetSpeed" :min="0" :max="20" :step="0.1" show-input class="scifi-slider" />
                          </el-form-item>
                          <el-form-item label="鍒囧壊楂樺害">
                            <el-slider v-model="controlParams.cuttingHeight" :min="0" :max="100" :step="1" show-input class="scifi-slider" />
                          </el-form-item>
                          <el-form-item label="喂入量">
                            <el-slider v-model="controlParams.feedingRate" :min="0" :max="100" :step="1" show-input class="scifi-slider" />
                          </el-form-item>
                          <el-form-item label="PID鍙傛暟">
                            <el-row :gutter="10">
                              <el-col :span="8">
                                <el-input-number v-model="controlParams.pidP" placeholder="P" :min="0" :step="0.1" class="scifi-input" />
                              </el-col>
                              <el-col :span="8">
                                <el-input-number v-model="controlParams.pidI" placeholder="I" :min="0" :step="0.1" class="scifi-input" />
                              </el-col>
                              <el-col :span="8">
                                <el-input-number v-model="controlParams.pidD" placeholder="D" :min="0" :step="0.1" class="scifi-input" />
                              </el-col>
                            </el-row>
                          </el-form-item>
                        </el-form>
                      </div>
                      <div class="card-glow"></div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="control-sub-card">
                      <div class="chart-header">
                        <span>鎺у埗鎿嶄綔</span>
                        <div class="header-glow"></div>
                      </div>
                      <div class="control-actions">
                        <el-button type="primary" size="large" @click="startMachine" :disabled="machineStatus === 'WORKING'" class="scifi-button">鍚姩</el-button>
                        <el-button type="danger" size="large" @click="stopMachine" :disabled="machineStatus !== 'WORKING'" class="scifi-button danger">鍋滄</el-button>
                        <el-button type="warning" size="large" @click="pauseMachine" :disabled="machineStatus !== 'WORKING'" class="scifi-button warning">鏆傚仠</el-button>
                        <el-button type="info" size="large" @click="resumeMachine" :disabled="machineStatus !== 'PAUSED'" class="scifi-button info">鎭㈠</el-button>
                      </div>
                      <div class="machine-status" style="margin-top: 20px;">
                        <el-tag :class="['status-tag', `status-${machineStatus.toLowerCase()}`]">{{ machineStatusText }}</el-tag>
                      </div>
                      <div class="control-log" style="margin-top: 20px;">
                        <h4>鎺у埗鏃ュ織</h4>
                        <el-scrollbar height="200px" class="scifi-scrollbar">
                          <div v-for="(log, index) in controlLogs" :key="index" class="log-item">
                            <span class="log-time">{{ log.time }}</span>
                            <span class="log-content">{{ log.content }}</span>
                          </div>
                        </el-scrollbar>
                      </div>
                      <div class="card-glow"></div>
                    </div>
                    <div class="control-sub-card" style="margin-top: 20px;">
                      <div class="chart-header">
                        <span>濮挎€佺洃鎺</span>
                        <div class="header-glow"></div>
                      </div>
                      <div ref="attitudeChart" class="attitude-chart"></div>
                      <div class="card-glow"></div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="card-glow"></div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 娣诲姞/缂栬緫鍐滄満瀵硅瘽妗?-->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      class="scifi-dialog"
    >
      <el-form :model="machineForm" label-width="80px">
        <el-form-item label="鍐滄満ID">
          <el-input v-model="machineForm.machineId" placeholder="璇疯緭鍏ュ啘鏈篒D" class="scifi-input" />
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="machineForm.model" placeholder="请输入型号" class="scifi-input" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="machineForm.status" placeholder="请选择状态" class="scifi-select">
            <el-option label="鍦ㄧ嚎" value="ONLINE" />
            <el-option label="绂荤嚎" value="OFFLINE" />
            <el-option label="工作中" value="WORKING" />
            <el-option label="鏁呴殰" value="ERROR" />
          </el-select>
        </el-form-item>
        <el-form-item label="浣嶇疆">
          <el-input v-model="machineForm.location" placeholder="请输入位置" class="scifi-input" />
        </el-form-item>
        <el-form-item label="鍙傛暟">
          <el-input v-model="machineForm.parameters" placeholder="请输入参数" type="textarea" class="scifi-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="scifi-button">鍙栨秷</el-button>
          <el-button type="primary" @click="saveMachine" class="scifi-button">纭畾</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 鍒涘缓浠诲姟瀵硅瘽妗?-->
    <el-dialog
      v-model="taskDialogVisible"
      title="鍒涘缓浠诲姟"
      width="500px"
      class="scifi-dialog"
    >
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="鍦板潡鍚嶇О">
          <el-input v-model="taskForm.fieldName" placeholder="请输入地块名称" class="scifi-input" />
        </el-form-item>
        <el-form-item label="鍐滄満ID">
          <el-input v-model="taskForm.machineId" placeholder="璇疯緭鍏ュ啘鏈篒D" class="scifi-input" />
        </el-form-item>
        <el-form-item label="鐩爣闈㈢Н">
          <el-input v-model.number="taskForm.targetArea" placeholder="请输入目标面积" type="number" class="scifi-input" />
        </el-form-item>
        <el-form-item label="棰勪及浜ч噺">
          <el-input v-model.number="taskForm.estimatedYield" placeholder="请输入预计产量" type="number" class="scifi-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="taskDialogVisible = false" class="scifi-button">鍙栨秷</el-button>
          <el-button type="primary" @click="saveTask" class="scifi-button">纭畾</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive, watch, computed } from 'vue'
import * as echarts from 'echarts'

// 妯℃嫙鏁版嵁
const machines = ref([
  { machineId: 'machine-001', model: 'John Deere S780', status: 'ONLINE', location: '东地块', lastUpdated: new Date().toISOString(), parameters: '{"engine_hours": 1200, "fuel_level": 85, "cutting_width": 12}' },
  { machineId: 'machine-002', model: 'Case IH Axial-Flow 9240', status: 'OFFLINE', location: '西地块', lastUpdated: new Date().toISOString(), parameters: '{"engine_hours": 850, "fuel_level": 60, "cutting_width": 10}' },
  { machineId: 'machine-003', model: 'New Holland CR10.90', status: 'WORKING', location: '南地块', lastUpdated: new Date().toISOString(), parameters: '{"engine_hours": 1500, "fuel_level": 90, "cutting_width": 14}' }
])

const tasks = ref([
  { taskId: 'task-001', fieldName: '东地块', machineId: 'machine-001', status: 'IN_PROGRESS', targetArea: 100, completedArea: 45, estimatedYield: 25, startTime: new Date().toISOString() },
  { taskId: 'task-002', fieldName: '西地块', machineId: 'machine-002', status: 'PENDING', targetArea: 80, completedArea: 0, estimatedYield: 20, startTime: new Date().toISOString() },
  { taskId: 'task-003', fieldName: '南地块', machineId: 'machine-003', status: 'COMPLETED', targetArea: 75, completedArea: 75, estimatedYield: 18, startTime: new Date().toISOString() }
])

export default {
  name: 'IntegratedView',
  setup() {
    const activeTab = ref('overview')
    const activeNav = ref('home')
    const currentDateTime = ref('')
    
    // 鏇存柊褰撳墠鏃ユ湡鏃堕棿
    const updateDateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      currentDateTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    // 鍒濆鍖栨椂鏇存柊涓€娆?    updateDateTime()
    // 姣忕鏇存柊涓€娆?    setInterval(updateDateTime, 1000)
    
    const handleTabClick = () => {
    }
    
    // 绯荤粺姒傝鏁版嵁
    const onlineMachines = ref(5)
    const activeTasks = ref(3)
    const todayHarvest = ref(120)
    const estimatedYield = ref(25)
    const progressChart = ref(null)
    const yieldChart = ref(null)
    const recentTasks = ref([
      { taskId: 'task-001', fieldName: '东地块', machineId: 'machine-001', status: 'IN_PROGRESS', completedArea: 45 },
      { taskId: 'task-002', fieldName: '西地块', machineId: 'machine-002', status: 'PENDING', completedArea: 0 },
      { taskId: 'task-003', fieldName: '南地块', machineId: 'machine-003', status: 'COMPLETED', completedArea: 75 }
    ])
    
    // 鍐滄満绠＄悊鏁版嵁
    const dialogVisible = ref(false)
    const dialogTitle = ref('娣诲姞鍐滄満')
    const machineForm = reactive({
      machineId: '',
      model: '',
      status: 'OFFLINE',
      location: '',
      parameters: ''
    })
    
    // 浠诲姟绠＄悊鏁版嵁
    const taskDialogVisible = ref(false)
    const taskForm = reactive({
      fieldName: '',
      machineId: '',
      targetArea: 0,
      estimatedYield: 0
    })
    
    const selectedMachineId = ref('machine-001')
    const sensorData = ref([
      { sensorType: 'speed', value: 8.5, unit: 'km/h', timestamp: new Date().toISOString(), location: '东地块' },
      { sensorType: 'temperature', value: 65, unit: '℃', timestamp: new Date().toISOString(), location: '东地块' },
      { sensorType: 'humidity', value: 55, unit: '%', timestamp: new Date().toISOString(), location: '东地块' },
      { sensorType: 'pressure', value: 2.8, unit: 'bar', timestamp: new Date().toISOString(), location: '东地块' }
    ])
    const speedChart = ref(null)
    const temperatureChart = ref(null)
    const humidityChart = ref(null)
    const pressureChart = ref(null)
    
    // AI瑙嗚璇嗗埆鏁版嵁
    const previewImage = ref(null)
    const previewImageSrc = ref('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=agricultural%20field%20with%20crops%20ready%20for%20harvest&image_size=landscape_16_9')
    const detections = ref([])
    const heatmapChart = ref(null)
    const processingTime = ref(0)
    const averageConfidence = ref(0)
    
    // 鍖楁枟鍗槦瀵艰埅鏁版嵁
    const beidouMap = ref(null)
    const mapUrl = ref('')
    const routeForm = reactive({
      startPoint: '',
      endPoint: '',
      planningMode: 'optimal',
      speed: 10
    })
    const satelliteCount = ref(12)
    const satellites = ref([
      { id: 1, signal: 45 },
      { id: 2, signal: 42 },
      { id: 3, signal: 38 },
      { id: 4, signal: 35 },
      { id: 5, signal: 30 },
      { id: 6, signal: 28 }
    ])
    const routeInfo = ref([
      { key: '璺嚎闀垮害', value: '0 km' },
      { key: '棰勮鏃堕棿', value: '0 鍒嗛挓' },
      { key: '途经点', value: '0 个' },
      { key: '规划模式', value: '最优路径' }
    ])
    
    // 鑾峰彇鐢ㄦ埛褰撳墠浣嶇疆
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            
            // 浣跨敤楂樺痉鍦板浘闈欐€佸浘API
            mapUrl.value = `https://restapi.amap.com/v3/staticmap?key=${import.meta.env.VITE_AMAP_KEY || ''}&location=${longitude},${latitude}&zoom=15&size=800*400&markers=mid,,A:${longitude},${latitude}`
          },
          (error) => {
            console.error('鑾峰彇浣嶇疆澶辫触:', error)
            mapUrl.value = `https://restapi.amap.com/v3/staticmap?key=${import.meta.env.VITE_AMAP_KEY || ''}&location=116.404,39.915&zoom=15&size=800*400&markers=mid,,A:116.404,39.915`
          }
        )
      } else {
        console.error('娴忚鍣ㄤ笉鏀寔鍦扮悊瀹氫綅')
        // 涓嶆敮鎸佹椂浣跨敤榛樿浣嶇疆
        mapUrl.value = `https://restapi.amap.com/v3/staticmap?key=${import.meta.env.VITE_AMAP_KEY || ''}&location=116.404,39.915&zoom=15&size=800*400&markers=mid,,A:116.404,39.915`
      }
    }
    
    // 鎺у埗绯荤粺鏁版嵁
    const speed = ref(0)
    const rpm = ref(0)
    const temperature = ref(0)
    const pressure = ref(0)
    const attitudeAngle = ref(0)
    const positionAccuracy = ref(0)
    const machineStatus = ref('STOPPED')
    const controlParams = reactive({
      targetSpeed: 10,
      cuttingHeight: 50,
      feedingRate: 70,
      pidP: 1.2,
      pidI: 0.5,
      pidD: 0.3
    })
    const controlLogs = ref([])
    const attitudeChart = ref(null)
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString()
    }
    
    // 鍐滄満绠＄悊鏂规硶
    const openAddMachineDialog = () => {
      dialogTitle.value = '娣诲姞鍐滄満'
      Object.assign(machineForm, {
        machineId: '',
        model: '',
        status: 'OFFLINE',
        location: '',
        parameters: ''
      })
      dialogVisible.value = true
    }
    
    const editMachine = (machine) => {
      dialogTitle.value = '缂栬緫鍐滄満'
      Object.assign(machineForm, machine)
      dialogVisible.value = true
    }
    
    const saveMachine = () => {
      if (machineForm.machineId) {
        // 缂栬緫鐜版湁鍐滄満
        const index = machines.value.findIndex(m => m.machineId === machineForm.machineId)
        if (index !== -1) {
          machines.value[index] = { ...machineForm }
        }
      } else {
        machines.value.push({ ...machineForm, machineId: `machine-${machines.value.length + 1}`, lastUpdated: new Date().toISOString() })
      }
      dialogVisible.value = false
    }
    
    const deleteMachine = (machineId) => {
      machines.value = machines.value.filter(m => m.machineId !== machineId)
    }
    
    // 浠诲姟绠＄悊鏂规硶
    const openAddTaskDialog = () => {
      Object.assign(taskForm, {
        fieldName: '',
        machineId: '',
        targetArea: 0,
        estimatedYield: 0
      })
      taskDialogVisible.value = true
    }
    
    const saveTask = () => {
      tasks.value.push({ 
        ...taskForm, 
        taskId: `task-${tasks.value.length + 1}`, 
        status: 'PENDING', 
        completedArea: 0, 
        startTime: new Date().toISOString() 
      })
      taskDialogVisible.value = false
    }
    
    const updateTaskStatus = (taskId, status) => {
      const task = tasks.value.find(t => t.taskId === taskId)
      if (task) {
        task.status = status
        if (status === 'COMPLETED') {
          task.completedArea = task.targetArea
        }
      }
    }
    
    const deleteTask = (taskId) => {
      tasks.value = tasks.value.filter(t => t.taskId !== taskId)
    }
    
    const initSpeedChart = () => {
      const chart = echarts.init(speedChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowColor: 'rgba(0, 255, 255, 0.3)'
          },
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '閫熷害(km/h)',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '閫熷害',
            type: 'line',
            data: [5, 8, 12, 10, 7, 4],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ffff' },
                { offset: 1, color: '#0066ff' }
              ])
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    const initTemperatureChart = () => {
      const chart = echarts.init(temperatureChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowColor: 'rgba(0, 255, 255, 0.3)'
          },
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '娓╁害(鈩?',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '娓╁害',
            type: 'line',
            data: [20, 18, 22, 28, 26, 22],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff6496' },
                { offset: 1, color: '#ff0066' }
              ])
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    const initHumidityChart = () => {
      const chart = echarts.init(humidityChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowColor: 'rgba(0, 255, 255, 0.3)'
          },
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '婀垮害(%)',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '婀垮害',
            type: 'line',
            data: [60, 65, 55, 45, 50, 58],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00c8ff' },
                { offset: 1, color: '#0066ff' }
              ])
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    const initPressureChart = () => {
      const chart = echarts.init(pressureChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowColor: 'rgba(0, 255, 255, 0.3)'
          },
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '鍘嬪姏(bar)',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '鍘嬪姏',
            type: 'line',
            data: [2.5, 2.8, 3.2, 3.0, 2.7, 2.6],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ffff' },
                { offset: 1, color: '#00c8ff' }
              ])
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    // AI瑙嗚璇嗗埆鏂规硶
    const getDetectionStyle = (detection) => {
      return {
        left: `${detection.x}px`,
        top: `${detection.y}px`,
        width: `${detection.width}px`,
        height: `${detection.height}px`
      }
    }
    
    const startRecognition = () => {
      // 杩欓噷鍙互璋冪敤鍚庣API杩涜瀹為檯鐨凙I璇嗗埆
    }
    
    const initHeatmap = () => {
      const chart = echarts.init(heatmapChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          position: 'top',
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          height: '50%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: ['东', '南', '西', '北', '中'],
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'category',
          data: ['A', 'B', 'C', 'D', 'E'],
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          inRange: {
            color: ['#e0f2ff', '#bae0ff', '#69c0ff', '#1890ff', '#096dd9']
          }
        },
        series: [
          {
            name: '产量分布',
            type: 'heatmap',
            data: [
              [0, 0, 65], [0, 1, 59], [0, 2, 80], [0, 3, 81], [0, 4, 56],
              [1, 0, 55], [1, 1, 49], [1, 2, 70], [1, 3, 72], [1, 4, 45],
              [2, 0, 45], [2, 1, 35], [2, 2, 50], [2, 3, 55], [2, 4, 30],
              [3, 0, 75], [3, 1, 65], [3, 2, 85], [3, 3, 86], [3, 4, 60],
              [4, 0, 80], [4, 1, 70], [4, 2, 90], [4, 3, 91], [4, 4, 75]
            ],
            label: {
              show: true,
              color: '#ffffff'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 255, 255, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    // 鎺у埗绯荤粺鏂规硶
    const machineStatusText = computed(() => {
      switch (machineStatus.value) {
        case 'WORKING': return '工作中'
        case 'STOPPED': return '已停止'
        case 'PAUSED': return '已暂停'
        case 'ERROR': return '故障'
        default: return '未知'
      }
    })
    
    const startMachine = () => {
      machineStatus.value = 'WORKING'
      controlLogs.value.push({ time: new Date().toLocaleString(), content: '鍐滄満鍚姩' })
    }
    
    const stopMachine = () => {
      machineStatus.value = 'STOPPED'
      controlLogs.value.push({ time: new Date().toLocaleString(), content: '鍐滄満鍋滄' })
    }
    
    const pauseMachine = () => {
      machineStatus.value = 'PAUSED'
      controlLogs.value.push({ time: new Date().toLocaleString(), content: '鍐滄満鏆傚仠' })
    }
    
    const resumeMachine = () => {
      machineStatus.value = 'WORKING'
      controlLogs.value.push({ time: new Date().toLocaleString(), content: '鍐滄満鎭㈠宸ヤ綔' })
    }
    
    // 鍖楁枟鍗槦瀵艰埅鏂规硶
    const planRoute = () => {
      // 妯℃嫙璺嚎瑙勫垝
      // 鏇存柊璺嚎淇℃伅
      routeInfo.value = [
        { key: '璺嚎闀垮害', value: '5.2 km' },
        { key: '棰勮鏃堕棿', value: '15 鍒嗛挓' },
        { key: '途经点', value: '3 个' },
        { key: '规划模式', value: routeForm.planningMode === 'shortest' ? '最短路径' : routeForm.planningMode === 'optimal' ? '最优路径' : '避障路径' }
      ]
      // 妯℃嫙鍦板浘鏄剧ず璺嚎
      initBeidouMap()
    }
    
    const startNavigation = () => {
      // 杩欓噷鍙互娣诲姞瀵艰埅閫昏緫
    }
    
    const initBeidouMap = () => {
      // 鍒濆鍖栧湴鍥撅紝鑾峰彇褰撳墠浣嶇疆
      getCurrentLocation()
    }
    
    const initAttitudeChart = () => {
      const chart = echarts.init(attitudeChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          data: ['横滚角', '俯仰角', '偏航角'],
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['0s', '5s', '10s', '15s', '20s', '25s', '30s'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '瑙掑害(掳)',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '横滚角',
            type: 'line',
            data: [0, 1, 2, 1.5, 2.5, 2, 1.5],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ffff' },
                { offset: 1, color: '#0066ff' }
              ])
            }
          },
          {
            name: '俯仰角',
            type: 'line',
            data: [0, 0.5, 1, 0.8, 1.2, 1, 0.8],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00c8ff' },
                { offset: 1, color: '#0066ff' }
              ])
            }
          },
          {
            name: '偏航角',
            type: 'line',
            data: [0, 0.2, 0.5, 0.3, 0.6, 0.4, 0.3],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff6496' },
                { offset: 1, color: '#ff0066' }
              ])
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    // 绯荤粺姒傝鍥捐〃
    const initProgressChart = () => {
      const chart = echarts.init(progressChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowColor: 'rgba(0, 255, 255, 0.3)'
          },
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['东地块', '西地块', '南地块', '北地块'],
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          name: '完成面积(亩)',
          nameTextStyle: {
            color: '#00ffff'
          },
          axisLine: {
            lineStyle: {
              color: '#00ffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '完成面积',
            type: 'bar',
            data: [45, 0, 75, 30],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ffff' },
                { offset: 1, color: '#0066ff' }
              ]),
              borderColor: '#00ffff',
              borderWidth: 1
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 255, 255, 0.5)'
              }
            }
          },
          {
            name: '目标面积',
            type: 'bar',
            data: [100, 80, 75, 90],
            itemStyle: {
              color: 'rgba(0, 255, 255, 0.2)',
              borderColor: 'rgba(0, 255, 255, 0.5)',
              borderWidth: 1
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    const initYieldChart = () => {
      const chart = echarts.init(yieldChart.value)
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          borderColor: '#00ffff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#ffffff'
          }
        },
        series: [
          {
            name: '浜ч噺鍒嗗竷',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 12, name: '东地块' },
              { value: 8, name: '西地块' },
              { value: 5, name: '南地块' }
            ],
            itemStyle: {
              borderColor: '#0a0a20',
              borderWidth: 2
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 255, 255, 0.5)'
              }
            },
            label: {
              color: '#ffffff'
            },
            labelLine: {
              lineStyle: {
                color: '#00ffff'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    onMounted(() => {
      initProgressChart()
      initYieldChart()
      initSpeedChart()
      initTemperatureChart()
      initHumidityChart()
      initPressureChart()
      initHeatmap()
      initAttitudeChart()
    })
    
    window.addEventListener('resize', () => {
      if (progressChart.value) progressChart.value.resize()
      if (yieldChart.value) yieldChart.value.resize()
      if (speedChart.value) speedChart.value.resize()
      if (temperatureChart.value) temperatureChart.value.resize()
      if (humidityChart.value) humidityChart.value.resize()
      if (pressureChart.value) pressureChart.value.resize()
      if (heatmapChart.value) heatmapChart.value.resize()
      if (attitudeChart.value) attitudeChart.value.resize()
    })
    
    return {
      activeTab,
      activeNav,
      currentDateTime,
      handleTabClick,
      // 鍦板浘
      mapUrl,
      
      // 绯荤粺姒傝
      onlineMachines,
      activeTasks,
      todayHarvest,
      estimatedYield,
      progressChart,
      yieldChart,
      recentTasks,
      
      // 鍐滄満绠＄悊
      machines,
      dialogVisible,
      dialogTitle,
      machineForm,
      openAddMachineDialog,
      editMachine,
      saveMachine,
      deleteMachine,
      
      // 浠诲姟绠＄悊
      tasks,
      taskDialogVisible,
      taskForm,
      openAddTaskDialog,
      saveTask,
      updateTaskStatus,
      deleteTask,
      
      selectedMachineId,
      sensorData,
      speedChart,
      temperatureChart,
      humidityChart,
      pressureChart,
      
      // AI瑙嗚璇嗗埆
      previewImage,
      previewImageSrc,
      detections,
      heatmapChart,
      processingTime,
      averageConfidence,
      getDetectionStyle,
      startRecognition,
      
      // 鍖楁枟鍗槦瀵艰埅
      beidouMap,
      routeForm,
      satelliteCount,
      satellites,
      routeInfo,
      planRoute,
      startNavigation,
      
      // 鎺у埗绯荤粺
      speed,
      rpm,
      temperature,
      pressure,
      attitudeAngle,
      positionAccuracy,
      machineStatus,
      machineStatusText,
      controlParams,
      controlLogs,
      attitudeChart,
      startMachine,
      stopMachine,
      pauseMachine,
      resumeMachine,
      
      // 閫氱敤鏂规硶
      formatDate
    }
  }
}
</script>

<style scoped>
/* 椤堕儴瀵艰埅鏍?*/
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(90deg, #001f54 0%, #003479 100%);
  border-bottom: 2px solid #00aaff;
  position: relative;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 170, 255, 0.3);
  margin: -20px -20px 20px -20px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.system-name {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  margin-right: 20px;
  text-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
}

.nav-indicators {
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  background: #00aaff;
  border-radius: 50%;
  animation: indicatorPulse 2s ease-in-out infinite;
}

.indicator:nth-child(2) {
  animation-delay: 0.3s;
}

.indicator:nth-child(3) {
  animation-delay: 0.6s;
}

.indicator:nth-child(4) {
  animation-delay: 0.9s;
}

.indicator:nth-child(5) {
  animation-delay: 1.2s;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  background: transparent !important;
  border-bottom: none !important;
}

/* 闅愯棌瀛愯彍鍗曠浉鍏冲厓绱?*/
.nav-menu .el-sub-menu {
  display: none !important;
}

.nav-menu .el-sub-menu__title {
  display: none !important;
}

.nav-menu .el-sub-menu__icon-arrow {
  display: none !important;
}

.nav-menu .el-sub-menu__icon-more {
  display: none !important;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.nav-menu .el-menu-item:hover {
  color: #00aaff;
  background: rgba(0, 170, 255, 0.1) !important;
}

.nav-menu .el-menu-item.is-active {
  color: #00aaff;
  background: rgba(0, 170, 255, 0.2) !important;
  border-bottom: 2px solid #00aaff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.weather {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.user-button {
  background: #00aaff !important;
  border-color: #00aaff !important;
  color: #ffffff !important;
}

.user-button:hover {
  background: #0088cc !important;
  border-color: #0088cc !important;
}

/* 鍏ㄥ眬鏍峰紡 */
.integrated-view {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0a1128 0%, #001f54 100%);
  color: #ffffff;
}

/* 鑳屾櫙鏁堟灉 */
.bg-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 170, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 170, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 170, 255, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: glowPulse 4s ease-in-out infinite;
}

/* 绯荤粺鏍囬 */
.system-title {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.system-title h1 {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00aaff, #0066ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(0, 170, 255, 0.5);
}

.title-subtitle {
  font-size: 1rem;
  color: rgba(0, 170, 255, 0.7);
  letter-spacing: 3px;
}

.title-glow {
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00aaff, transparent);
  transform: translateX(-50%);
  animation: lineGlow 2s ease-in-out infinite;
}

/* 鏍囩椤靛鍣?*/
.tabs-container {
  margin-top: 20px;
}

.scifi-tabs {
  background: rgba(0, 31, 84, 0.8);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 10px;
  padding: 10px;
  backdrop-filter: blur(10px);
}

.scifi-tabs .el-tabs__header {
  margin-bottom: 20px;
}

.scifi-tabs .el-tabs__nav {
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
}

.scifi-tabs .el-tabs__item {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 30px;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.scifi-tabs .el-tabs__item:hover {
  color: #00aaff;
}

.scifi-tabs .el-tabs__item.is-active {
  color: #00aaff;
  border-bottom: 2px solid #00aaff;
}

.tab-pane {
  padding: 20px;
}

/* 绔犺妭鏍囬 */
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.section-title span {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00aaff;
  margin-right: 10px;
}

.title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #00aaff, transparent);
}

/* 姒傝缁熻 */
.overview-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(0, 31, 84, 0.8);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  min-width: 200px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  animation: iconPulse 2s ease-in-out infinite;
}

.stat-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  color: #00aaff !important;
  font-size: 1.8rem !important;
  font-weight: bold !important;
  text-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
}

.stat-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00aaff, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

/* 鍥捐〃鍖哄煙 */
.charts-section {
  margin-bottom: 40px;
}

.chart-card {
  background: rgba(0, 31, 84, 0.8);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  height: 350px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 170, 255, 0.1);
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.2);
}

.chart-header span {
  font-size: 1.1rem;
  font-weight: bold;
  color: #00aaff;
  text-shadow: 0 0 8px rgba(0, 170, 255, 0.5);
  position: relative;
  z-index: 1;
}

.header-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, #00aaff, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

.chart {
  width: 100%;
  height: calc(100% - 60px);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 255, 255, 0.08) 50%, transparent 100%);
  pointer-events: none;
  animation: cardGlow 4s ease-in-out infinite;
}

@keyframes cardGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 浠诲姟鍒楄〃 */
.tasks-section {
  margin-bottom: 40px;
}

.tasks-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.tasks-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  position: relative;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.card-header span {
  font-size: 1.1rem;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

/* 琛ㄦ牸鏍峰紡 */
.scifi-table {
  background: rgba(10, 10, 30, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.scifi-table th {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  font-weight: bold !important;
}

.scifi-table td {
  background: rgba(10, 10, 30, 0.4) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.scifi-table tr:hover td {
  background: rgba(0, 255, 255, 0.05) !important;
}

.table-cell {
  transition: all 0.3s ease;
}

.table-cell:hover {
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* 鐘舵€佹爣绛?*/
.status-tag {
  border-radius: 12px;
  font-size: 0.8rem;
  padding: 2px 10px;
  font-weight: bold;
}

.status-online {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid #00ffff;
  color: #00ffff;
  box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.status-offline {
  background: rgba(0, 102, 255, 0.2);
  border: 1px solid #0066ff;
  color: #0066ff;
  box-shadow: 0 0 5px rgba(0, 102, 255, 0.3);
}

.status-working {
  background: rgba(0, 200, 255, 0.2);
  border: 1px solid #00c8ff;
  color: #00c8ff;
  box-shadow: 0 0 5px rgba(0, 200, 255, 0.3);
}

.status-error {
  background: rgba(255, 100, 150, 0.2);
  border: 1px solid #ff6496;
  color: #ff6496;
  box-shadow: 0 0 5px rgba(255, 100, 150, 0.3);
}

.status-pending {
  background: rgba(0, 102, 255, 0.2);
  border: 1px solid #0066ff;
  color: #0066ff;
  box-shadow: 0 0 5px rgba(0, 102, 255, 0.3);
}

.status-in_progress {
  background: rgba(0, 200, 255, 0.2);
  border: 1px solid #00c8ff;
  color: #00c8ff;
  box-shadow: 0 0 5px rgba(0, 200, 255, 0.3);
}

.status-completed {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid #00ffff;
  color: #00ffff;
  box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.status-stopped {
  background: rgba(0, 102, 255, 0.2);
  border: 1px solid #0066ff;
  color: #0066ff;
  box-shadow: 0 0 5px rgba(0, 102, 255, 0.3);
}

.status-paused {
  background: rgba(0, 200, 255, 0.2);
  border: 1px solid #00c8ff;
  color: #00c8ff;
  box-shadow: 0 0 5px rgba(0, 200, 255, 0.3);
}

/* 杩涘害鏉?*/
.progress-bar-container {
  position: relative;
  height: 20px;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0066ff);
  border-radius: 10px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

/* 鎸夐挳鏍峰紡 */
.scifi-button {
  background: rgba(0, 255, 255, 0.2) !important;
  border: 1px solid #00ffff !important;
  color: #00ffff !important;
  border-radius: 5px !important;
  transition: all 0.3s ease !important;
}

.scifi-button:hover {
  background: rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

.scifi-button.danger {
  background: rgba(220, 53, 69, 0.2) !important;
  border: 1px solid #dc3545 !important;
  color: #dc3545 !important;
}

.scifi-button.danger:hover {
  background: rgba(220, 53, 69, 0.3) !important;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.5) !important;
}

.scifi-button.success {
  background: rgba(40, 167, 69, 0.2) !important;
  border: 1px solid #28a745 !important;
  color: #28a745 !important;
}

.scifi-button.success:hover {
  background: rgba(40, 167, 69, 0.3) !important;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5) !important;
}

.scifi-button.warning {
  background: rgba(255, 165, 0, 0.2) !important;
  border: 1px solid orange !important;
  color: orange !important;
}

.scifi-button.warning:hover {
  background: rgba(255, 165, 0, 0.3) !important;
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.5) !important;
}

.scifi-button.info {
  background: rgba(0, 123, 255, 0.2) !important;
  border: 1px solid #007bff !important;
  color: #007bff !important;
}

.scifi-button.info:hover {
  background: rgba(0, 123, 255, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
}

/* 杈撳叆妗嗘牱寮?*/
.scifi-input {
  background: rgba(10, 10, 30, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 5px !important;
}

.scifi-input:focus {
  border-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

/* 閫夋嫨妗嗘牱寮?*/
.scifi-select {
  background: rgba(10, 10, 30, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 5px !important;
}

.scifi-select .el-select__wrapper {
  background: rgba(10, 10, 30, 0.8) !important;
}

.scifi-select .el-select__input {
  color: #ffffff !important;
  background: transparent !important;
}

.scifi-select .el-select__placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

.scifi-select .el-select__selection {
  background: rgba(10, 10, 30, 0.8) !important;
}

.scifi-select .el-select__selected-item {
  color: #ffffff !important;
  background: transparent !important;
}

.scifi-select .el-select__caret {
  color: #00ffff !important;
}

/* 涓嬫媺鑿滃崟鏍峰紡 */
.scifi-select .el-select-dropdown {
  background: rgba(10, 10, 30, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 5px !important;
}

.scifi-select .el-select-dropdown__item {
  color: rgba(255, 255, 255, 0.8) !important;
}

.scifi-select .el-select-dropdown__item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.scifi-select .el-select-dropdown__item.selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 婊戝潡鏍峰紡 */
.scifi-slider .el-slider__runway {
  background: rgba(0, 255, 255, 0.2) !important;
  border-radius: 5px !important;
}

.scifi-slider .el-slider__bar {
  background: linear-gradient(90deg, #00ffff, #0066ff) !important;
  border-radius: 5px !important;
}

.scifi-slider .el-slider__button {
  border: 2px solid #00ffff !important;
  background: rgba(10, 10, 30, 0.8) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

/* 婊氬姩鏉℃牱寮?*/
.scifi-scrollbar .el-scrollbar__bar {
  background: rgba(0, 255, 255, 0.3) !important;
}

.scifi-scrollbar .el-scrollbar__thumb {
  background: #00ffff !important;
  border-radius: 10px !important;
}

/* 瀵硅瘽妗嗘牱寮?*/
.scifi-dialog {
  background: rgba(10, 10, 30, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 10px !important;
  backdrop-filter: blur(10px) !important;
}

.scifi-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
}

.scifi-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
}

.scifi-dialog .el-dialog__body {
  color: #ffffff !important;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 鍐滄満绠＄悊 */
.machine-management {
  padding: 0;
}

.machines-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.machines-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

/* 浠诲姟绠＄悊 */
.task-management {
  padding: 0;
}

/* 浼犳劅鍣ㄦ暟鎹?*/
.sensor-data {
  padding: 0;
}

.sensor-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.sensor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.sensor-charts {
  margin-bottom: 24px;
}

/* AI瑙嗚璇嗗埆 */
.ai-vision {
  padding: 0;
}

.vision-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.vision-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.vision-content {
  margin-top: 24px;
}

.vision-sub-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  height: 400px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.vision-sub-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.preview-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.1);
}

.preview-container:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-container:hover .preview-image {
  transform: scale(1.02);
}

.detection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.detection-box {
  position: absolute;
  border: 2px solid #00ffff;
  border-radius: 4px;
  background-color: rgba(0, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
  }
}

.detection-label {
  position: absolute;
  top: -20px;
  left: 0;
  background-color: #00ffff;
  color: #0a0a20;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.5);
}

.detection-results {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 12px;
  background: rgba(10, 10, 30, 0.4);
}

.stats-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.stats-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.stats-content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 24px;
}

.heatmap-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  height: 400px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.heatmap-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.heatmap {
  width: 100%;
  height: 350px;
}

/* 鍖楁枟鍗槦瀵艰埅 */
.beidou-navigation {
  padding: 0;
}

.beidou-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.beidou-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.beidou-content {
  margin-top: 24px;
}

.map-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  height: 500px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.map-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #0a1128 0%, #001f54 100%);
  position: relative;
  border: 1px solid rgba(0, 170, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 170, 255, 0.1);
}

/* 鍖楁枟鍗槦鍦板浘鏁堟灉 */
.map-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 170, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 170, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

/* 鍗槦瑕嗙洊鏁堟灉 */
.map-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(0, 170, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(0, 170, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* 鍦板浘鏍囪鐐?*/
.map-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #00aaff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 170, 255, 0.8);
  animation: markerPulse 2s ease-in-out infinite;
}

.map-marker::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
}

/* 璺嚎 */
.map-route {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-route-path {
  fill: none;
  stroke: #00aaff;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  animation: routeAnimation 3s linear infinite;
}

/* 鏍囪鍔ㄧ敾 */
@keyframes markerPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
}

/* 璺嚎鍔ㄧ敾 */
@keyframes routeAnimation {
  0% {
    stroke-dashoffset: 20;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.route-planning-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.route-planning-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.planning-content {
  margin-top: 10px;
}

.satellite-status-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.satellite-status-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.satellite-content {
  margin-top: 10px;
}

.satellite-list {
  margin-top: 15px;
  max-height: 150px;
  overflow-y: auto;
}

.satellite-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.satellite-id {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.satellite-signal {
  font-size: 14px;
  font-weight: bold;
}

.satellite-signal.strong {
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.satellite-signal.weak {
  color: #ff6496;
  text-shadow: 0 0 5px rgba(255, 100, 150, 0.5);
}

.route-info {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.route-info:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

/* 鎺у埗绯荤粺 */
.control-system {
  padding: 0;
}

.control-card {
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.control-content {
  margin-top: 24px;
}

.control-sub-card {
  background: rgba(10, 10, 30, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 255, 255, 0.1);
}

.control-sub-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
}

.status-content {
  padding: 20px 0;
}

.control-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.control-actions .el-button {
  flex: 1;
  min-width: 100px;
}

.machine-status {
  margin-top: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.control-log {
  margin-top: 20px;
}

.control-log h4 {
  color: #00ffff;
  margin-bottom: 10px;
}

.log-item {
  display: flex;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.log-time {
  width: 150px;
  font-size: 12px;
  color: #909399;
}

.log-content {
  flex: 1;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.attitude-chart {
  width: 100%;
  height: 250px;
}

/* 鍔ㄧ敾鏁堟灉 */
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes lineGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes indicatorPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 鍝嶅簲寮忚璁?*/
@media (max-width: 768px) {
  .integrated-view {
    padding: 10px;
  }
  
  .system-title h1 {
    font-size: 2rem;
  }
  
  .overview-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-card {
    width: 100%;
    max-width: 300px;
  }
  
  .chart-card {
    height: 300px;
  }
  
  .vision-sub-card {
    height: 350px;
  }
  
  .preview-container {
    height: 250px;
  }
  
  .heatmap-card {
    height: 350px;
  }
  
  .heatmap {
    height: 300px;
  }
  
  .control-actions {
    flex-direction: column;
  }
  
  .control-actions .el-button {
    width: 100%;
  }
}
</style>



