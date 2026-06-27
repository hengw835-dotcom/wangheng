package com.smartharvester.config;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.smartharvester.service.MqttSensorMessageHandler;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class MQTTConfig {

    private static final Logger logger = LoggerFactory.getLogger(MQTTConfig.class);

    @Value("${mqtt.broker}")
    private String broker;

    @Value("${mqtt.clientId}")
    private String clientId;

    @Value("${mqtt.username}")
    private String username;

    @Value("${mqtt.password}")
    private String password;

    private final Environment environment;
    private final MqttSensorMessageHandler sensorMessageHandler;

    public MQTTConfig(Environment environment, MqttSensorMessageHandler sensorMessageHandler) {
        this.environment = environment;
        this.sensorMessageHandler = sensorMessageHandler;
    }

    @Bean
    public MqttClient mqttClient() {
        try {
            MemoryPersistence persistence = new MemoryPersistence();
            MqttClient client = new MqttClient(broker, clientId, persistence);
            
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            if (username != null && !username.isEmpty()) {
                options.setUserName(username);
                options.setPassword(password.toCharArray());
            }
            options.setConnectionTimeout(5);
            options.setKeepAliveInterval(20);
            options.setAutomaticReconnect(true);
            options.setCleanSession(false);

            List<String> topics = Binder.get(environment)
                    .bind("mqtt.topics", Bindable.listOf(String.class))
                    .orElse(List.of());
            int qos = environment.getProperty("mqtt.qos", Integer.class, 1);

            client.setCallback(new MqttCallbackExtended() {
                @Override
                public void connectComplete(boolean reconnect, String serverURI) {
                    try {
                        for (String topic : topics) {
                            client.subscribe(topic, qos);
                            logger.info("Subscribed to MQTT topic {} with QoS {}", topic, qos);
                        }
                    } catch (MqttException e) {
                        logger.error("Failed to subscribe to MQTT topics after connection", e);
                    }
                }

                @Override
                public void connectionLost(Throwable cause) {
                    logger.warn("MQTT connection lost; automatic reconnect is enabled", cause);
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
                    logger.info("Received MQTT message on {}: {}", topic, payload);
                    sensorMessageHandler.handle(topic, payload);
                }

                @Override
                public void deliveryComplete(org.eclipse.paho.client.mqttv3.IMqttDeliveryToken token) {
                    // No action required after delivery acknowledgement.
                }
            });

            client.connect(options);
            logger.info("MQTT client connected successfully");
            return client;
        } catch (MqttException e) {
            logger.warn("Failed to connect to MQTT broker: {}", e.getMessage());
            logger.warn("MQTT functionality will be disabled");
            return null;
        }
    }
}
