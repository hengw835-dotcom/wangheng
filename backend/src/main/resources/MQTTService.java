package com.smartharvester.service;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class MQTTService {

    private static final Logger logger = LoggerFactory.getLogger(MQTTService.class);

    @Autowired(required = false)
    private MqttClient mqttClient;
    
    private Map<String, MessageHandler> messageHandlers = new ConcurrentHashMap<>();
    private boolean isConnected = false;

    @PostConstruct
    public void init() {
        if (mqttClient != null && mqttClient.isConnected()) {
            isConnected = true;
            logger.info("MQTT Service initialized and connected");
        } else {
            logger.warn("MQTT Service initialized but not connected");
        }
    }

    // 发布消息到指定主题
    public void publish(String topic, String message, int qos) throws MqttException {
        if (!isConnected || mqttClient == null) {
            logger.error("Cannot publish: MQTT client not connected");
            throw new MqttException(MqttException.REASON_CODE_CLIENT_NOT_CONNECTED);
        }
        
        MqttMessage mqttMessage = new MqttMessage(message.getBytes());
        mqttMessage.setQos(qos);
        mqttMessage.setRetained(false);
        
        mqttClient.publish(topic, mqttMessage);
        logger.debug("Published message to topic: {}, message: {}", topic, message);
    }

    // 发布消息（使用默认 QoS）
    public void publish(String topic, String message) throws MqttException {
        publish(topic, message, 1);
    }

    // 订阅主题并注册处理器
    public void subscribe(String topic, MessageHandler handler) throws MqttException {
        subscribe(topic, 1, handler);
    }

    // 订阅主题并注册处理器（指定 QoS）
    public void subscribe(String topic, int qos, MessageHandler handler) throws MqttException {
        if (!isConnected || mqttClient == null) {
            logger.error("Cannot subscribe: MQTT client not connected");
            throw new MqttException(MqttException.REASON_CODE_CLIENT_NOT_CONNECTED);
        }
        
        mqttClient.subscribe(topic, qos);
        messageHandlers.put(topic, handler);
        logger.info("Subscribed to topic: {} with QoS: {}", topic, qos);
    }

    // 取消订阅
    public void unsubscribe(String topic) throws MqttException {
        if (!isConnected || mqttClient == null) {
            logger.error("Cannot unsubscribe: MQTT client not connected");
            return;
        }
        
        mqttClient.unsubscribe(topic);
        messageHandlers.remove(topic);
        logger.info("Unsubscribed from topic: {}", topic);
    }

    // 断开连接
    public void disconnect() throws MqttException {
        if (isConnected && mqttClient != null && mqttClient.isConnected()) {
            mqttClient.disconnect();
            isConnected = false;
            messageHandlers.clear();
            logger.info("MQTT client disconnected");
        }
    }

    // 检查连接状态
    public boolean isConnected() {
        return isConnected && mqttClient != null && mqttClient.isConnected();
    }

    // 获取客户端信息
    public String getClientId() {
        return mqttClient != null ? mqttClient.getClientId() : "N/A";
    }

    public String getServerUri() {
        return mqttClient != null ? mqttClient.getServerURI() : "N/A";
    }

    // 消息处理器接口
    @FunctionalInterface
    public interface MessageHandler {
        void handleMessage(String topic, String payload);
    }

    // 内部回调类（用于处理接收到的消息）
    public void handleIncomingMessage(String topic, String payload) {
        MessageHandler handler = messageHandlers.get(topic);
        if (handler != null) {
            handler.handleMessage(topic, payload);
        } else {
            logger.info("No handler registered for topic: {}", topic);
        }
    }

    @PreDestroy
    public void destroy() {
        try {
            disconnect();
        } catch (MqttException e) {
            logger.error("Error during MQTT shutdown: {}", e.getMessage());
        }
    }
}
