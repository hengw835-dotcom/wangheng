# 智能农机收割系统

## 项目简介
智能农机收割系统是一个基于AI视觉识别和线控协同控制的智能农业解决方案，旨在提高农业生产效率和自动化水平。

## 技术栈

### 后端
- Spring Boot 3.2.0
- Spring MVC
- Spring Data JPA
- WebSocket (STOMP)
- MQTT
- MySQL 8.0
- Redis

### 前端
- Vue 3
- Vite
- Pinia
- Vue Router
- Element Plus
- ECharts
- Three.js

### AI视觉识别
- YOLOv5/YOLOv8
- ONNX Runtime
- OpenCV

### 线控协同控制
- 自适应PID控制
- 互补滤波/卡尔曼滤波
- 多传感器融合

## 项目结构

```
smart-harvester/
├── backend/            # 后端Spring Boot项目
│   ├── src/main/java/com/smartharvester/  # 后端源代码
│   │   ├── config/     # 配置类
│   │   ├── controller/ # 控制器
│   │   ├── entity/     # 实体类
│   │   ├── repository/ # 数据访问层
│   │   ├── service/    # 业务逻辑层
│   │   └── SmartHarvesterApplication.java # 应用主类
│   ├── src/main/resources/ # 资源文件
│   │   ├── application.yml # 配置文件
│   │   └── init.sql # 数据库初始化脚本
│   └── pom.xml        # Maven配置文件
├── frontend/           # 前端Vue.js项目
│   ├── src/            # 前端源代码
│   │   ├── assets/     # 静态资源
│   │   ├── components/ # 组件
│   │   ├── views/      # 页面
│   │   ├── router/     # 路由
│   │   ├── store/      # 状态管理
│   │   ├── App.vue     # 根组件
│   │   └── main.js     # 主入口文件
│   ├── index.html      # HTML入口文件
│   ├── package.json    # npm配置文件
│   └── vite.config.js  # Vite配置文件
└── README.md           # 项目说明文档
```

## 快速开始

### 后端启动
1. 确保已安装MySQL和Redis
2. 执行数据库初始化脚本 `backend/src/main/resources/init.sql`
3. 进入backend目录，执行 `mvn spring-boot:run`

### 前端启动
1. 进入frontend目录，执行 `npm install` 安装依赖
2. 执行 `npm run dev` 启动开发服务器

## 主要功能

1. **农机管理**：管理农机设备的基本信息和状态
2. **任务管理**：创建和管理收割任务
3. **传感器数据**：实时监测和分析传感器数据
4. **AI视觉识别**：作物识别和产量分布分析
5. **控制系统**：实时控制农机的运行状态和参数

## API接口

### 农机管理
- GET /api/machines - 获取所有农机
- GET /api/machines/{machineId} - 获取单个农机
- POST /api/machines - 创建农机
- PUT /api/machines/{machineId}/status - 更新农机状态
- DELETE /api/machines/{id} - 删除农机

### 任务管理
- GET /api/tasks - 获取所有任务
- GET /api/tasks/{taskId} - 获取单个任务
- POST /api/tasks - 创建任务
- PUT /api/tasks/{taskId}/status - 更新任务状态
- PUT /api/tasks/{taskId}/progress - 更新任务进度

### 传感器数据
- POST /api/sensor-data - 提交传感器数据
- GET /api/sensor-data/machine/{machineId} - 获取农机的传感器数据
- GET /api/sensor-data/machine/{machineId}/type/{sensorType} - 获取特定类型的传感器数据

### AI视觉识别
- POST /api/ai-vision/detect - 图像识别
- GET /api/ai-vision/yield-distribution/{fieldId} - 获取产量分布

### 控制系统
- POST /api/control-system/update-sensor-data - 更新传感器数据
- POST /api/control-system/calculate-attitude - 姿态解算
- POST /api/control-system/calculate-control - 计算控制量
- POST /api/control-system/fuse-sensors - 传感器融合
- POST /api/control-system/calculate-load-model - 负荷模型计算

## 注意事项

1. 确保MySQL数据库服务正在运行，并且创建了 `smart_harvester` 数据库
2. 确保Redis服务正在运行
3. 前端开发服务器默认运行在 http://localhost:3000
4. 后端服务默认运行在 http://localhost:8080/api

## 未来规划

1. 集成更多AI模型，提高识别精度
2. 优化控制算法，提高农机的稳定性和效率
3. 增加移动端应用，实现远程监控
4. 开发数据分析和预测功能，提供决策支持
# Codex Merge Status

This repository has been merged against the enterprise frontend plan while preserving the existing backend contracts, auth model, routes, and Vite build system.

Current verified commands:

- Frontend tests: `node --test src/**/*.test.js` from `frontend`, passed 31/31.
- Frontend build: `powershell -File ./scripts/build-win.ps1` from `frontend`, passed with existing large-chunk warnings for Element Plus/ECharts.
- Backend tests: not run in this environment because Maven and `mvnw` are unavailable; Java 17 is installed.

Important production settings:

- `VITE_API_MODE=real` must be used for production. Mock mode is blocked by runtime config.
- Browser control commands must go through backend `/emqx/machines/{machineId}/control`; do not expose MQTT credentials to the browser.
- Sensor report pagination/statistics are currently frontend adapter logic because backend pageable/statistical endpoints are not present yet.
