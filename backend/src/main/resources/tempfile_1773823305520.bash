# 1. 检查 MQTT 连接状态
curl http://localhost:8080/api/mqtt/status

# 2. 发布测试消息
curl -X POST "http://localhost:8080/api/mqtt/publish?topic=harvester/test&message=Hello"

# 3. 在 MQTTX 中订阅主题查看消息
# 订阅：harvester/+/status
