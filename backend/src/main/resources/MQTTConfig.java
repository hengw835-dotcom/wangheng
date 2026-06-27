package com.smartharvester.config;

import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyStore;

@Configuration
public class MQTTConfig {

    private static final Logger logger = LoggerFactory.getLogger(MQTTConfig.class);

    @Autowired
    private MqttProperties mqttProperties;

    @Bean
    public MqttClient mqttClient() throws MqttException {
        MemoryPersistence persistence = new MemoryPersistence();
        MqttClient client = new MqttClient(mqttProperties.getBroker(), 
                                           mqttProperties.getClientId(), 
                                           persistence);
        
        MqttConnectOptions options = new MqttConnectOptions();
        
        // 基本配置
        options.setCleanSession(mqttProperties.getConnection().isCleanSession());
        options.setConnectionTimeout(mqttProperties.getConnection().getTimeout());
        options.setKeepAliveInterval(mqttProperties.getConnection().getKeepalive());
        
        // 认证信息
        if (mqttProperties.getUsername() != null && !mqttProperties.getUsername().isEmpty()) {
            options.setUserName(mqttProperties.getUsername());
            options.setPassword(mqttProperties.getPassword().toCharArray());
        }
        
        // SSL/TLS配置
        if (mqttProperties.getSsl().isEnabled()) {
            try {
                setupSSL(options);
            } catch (Exception e) {
                logger.error("Failed to setup SSL: {}", e.getMessage());
                throw new MqttException(MqttException.REASON_CODE_CONNECT_IN_PROGRESS, e);
            }
        }
        
        // 自动重连配置
        if (mqttProperties.getConnection().isAutoReconnect()) {
            options.setAutomaticReconnect(true);
        }
        
        // 设置遗嘱消息
        String willTopic = "harvester/" + mqttProperties.getClientId() + "/status";
        String willMessage = "offline";
        options.setWill(willTopic, willMessage, 1, true);
        
        // 设置回调
        client.setCallback(new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean reconnect, String serverURI) {
                logger.info("MQTT connected to: {}", serverURI);
                if (reconnect) {
                    logger.info("Reconnected to MQTT broker");
                    resubscribeTopics(client);
                }
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) {
                logger.info("Message arrived on topic: {}", topic);
                handleIncomingMessage(topic, message);
            }

            @Override
            public void connectionLost(Throwable cause) {
                logger.warn("MQTT connection lost: {}", cause.getMessage());
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
                logger.debug("Message delivery complete for token: {}", token);
            }
        });
        
        // 连接
        client.connect(options);
        logger.info("MQTT client connected successfully to broker: {}", mqttProperties.getBroker());
        
        // 订阅配置的主题
        subscribeToTopics(client);
        
        return client;
    }

    private void setupSSL(MqttConnectOptions options) throws Exception {
        String protocol = "ssl";
        options.setSSLServerCertType(protocol);
        
        // 加载证书
        if (mqttProperties.getSsl().getTrustStore() != null) {
            KeyStore trustStore = loadKeyStore(mqttProperties.getSsl().getTrustStore());
            options.setSocketFactory(
                javax.net.ssl.SSLContext.getDefault().getSocketFactory()
            );
        }
    }

    private KeyStore loadKeyStore(String path) throws Exception {
        KeyStore ks = KeyStore.getInstance("JKS");
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
            if (is == null) {
                throw new IOException("Keystore not found: " + path);
            }
            ks.load(is, "changeit".toCharArray());
        }
        return ks;
    }

    private void subscribeToTopics(MqttClient client) {
        try {
            for (String topic : mqttProperties.getTopics()) {
                client.subscribe(topic, mqttProperties.getQos());
                logger.info("Subscribed to topic: {}", topic);
            }
        } catch (MqttException e) {
            logger.error("Failed to subscribe to topics: {}", e.getMessage());
        }
    }

    private void resubscribeTopics(MqttClient client) {
        logger.info("Resubscribing to topics after reconnection...");
        subscribeToTopics(client);
    }

    private void handleIncomingMessage(String topic, MqttMessage message) {
        // 这里可以集成消息处理逻辑，比如转发到 WebSocket
        logger.info("Received message on topic {}: {}", topic, new String(message.getPayload()));
        
        // TODO: 可以将消息转发到 WebSocketController
    }

    @PostConstruct
    public void init() {
        logger.info("MQTT Configuration initialized with broker: {}", mqttProperties.getBroker());
    }
}
