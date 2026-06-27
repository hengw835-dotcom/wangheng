# 智能农机系统部署说明

## 1. 部署目标

生产部署包含：

- 前端 Vue 静态站点，由 Nginx 提供访问
- 后端 Spring Boot API
- MySQL 8.4
- Redis 7
- EMQX 5
- 可选 Prometheus / Grafana 监控

## 2. 服务器要求

- Docker 24+
- Docker Compose v2+
- 至少 2 核 CPU、4 GB 内存
- 建议开放端口：
  - `80`：前端访问
  - `8086`：后端 API，生产建议只允许内网或网关访问
  - `1883`：MQTT
  - `18083`：EMQX 控制台，生产建议限制 IP

## 3. 首次部署

复制环境变量模板：

```powershell
cd C:\Users\王老爹的book\Desktop\智能农机\smart-harvester
copy .env.production.example .env.production
```

编辑 `.env.production`，必须替换所有 `replace-with-*` 值。

启动：

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

验证：

```powershell
curl http://localhost/
curl http://localhost:8086/actuator/health
```

登录前端：

- 地址：`http://localhost/`
- 账号密码使用 `.env.production` 中配置的管理员或调度员账号

## 4. 生产环境变量

核心变量：

- `JWT_SECRET`：至少 32 位随机字符串
- `METRICS_TOKEN`：至少 24 位随机字符串
- `APP_CORS_ALLOWED_ORIGINS`：正式前端域名，例如 `https://agri.example.com`
- `MYSQL_PASSWORD`、`REDIS_PASSWORD`、`MQTT_PASSWORD`：必须使用强密码
- `ADMIN_PASSWORD` 等用户密码：不少于 12 位，不能使用默认值

前端第三方 Key：

- `VITE_BAIDU_MAP_AK`
- `VITE_AMAP_KEY`
- `VITE_OPENWEATHER_API_KEY`

Docker 部署默认通过 Nginx 反向代理 `/api`，因此 `VITE_API_BASE_URL` 可以留空。

## 5. 数据库

生产环境使用 Flyway 自动迁移：

- `V1__baseline_schema.sql`：基础表结构
- `V2__seed_demo_data.sql`：演示设备、任务、传感器样例数据

生产配置中 `spring.jpa.hibernate.ddl-auto=validate`，不会自动改表，表结构只由 Flyway 管理。

## 6. Nginx 路由

前端容器内 Nginx 已配置：

- `/`：前端静态页面
- `/api/`：代理到后端 `backend:8086`
- `/ws/`：代理 WebSocket
- 静态资源 30 天缓存
- 基础安全响应头

## 7. 监控

后端暴露：

- `/actuator/health`
- `/actuator/info`
- `/actuator/prometheus`

Prometheus 访问 `/actuator/prometheus` 必须携带 `Authorization: Bearer ${METRICS_TOKEN}`。

本地监控栈：

```powershell
cd observability
copy .env.example .env
copy prometheus-metrics-token.txt.example prometheus-metrics-token.txt
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 8. 上线前检查

必须确认：

- `.env.production` 不提交到仓库
- `backend/src/main/resources/**/.venv` 不进入打包产物
- `npm.cmd run build` 或容器 `npm run build:linux` 成功
- `mvn test` 成功
- `/actuator/health` 返回 `UP`
- EMQX 默认账号密码已替换
- 地图和天气 Key 已替换为自己的正式 Key

## 9. 常见问题

### 前端能打开但接口 404

检查 Nginx `/api/` 代理是否生效，Docker Compose 中 `backend` 服务名是否正常。

### 后端启动失败，提示密码过短

生产用户密码必须不少于 12 位，且不能是 `change-me` 或 `replace-me`。

### Prometheus 抓取 401

检查 `observability/prometheus-metrics-token.txt` 是否与后端 `METRICS_TOKEN` 完全一致。

### EMQX 未连接

检查：

- `MQTT_BROKER=tcp://emqx:1883`
- `MQTT_USERNAME`
- `MQTT_PASSWORD`
- EMQX 认证规则是否允许该客户端连接
