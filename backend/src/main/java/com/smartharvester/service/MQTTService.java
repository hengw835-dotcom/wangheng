package com.smartharvester.service;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class MQTTService {
    private static final Logger logger = LoggerFactory.getLogger(MQTTService.class);

    @Autowired(required = false)
    private MqttClient mqttClient;

    public void publish(String topic, String message, int qos) throws MqttException {
        if (!isConnected()) {
            throw new IllegalStateException("EMQX broker is not connected");
        }
        MqttMessage mqttMessage = new MqttMessage(message.getBytes(StandardCharsets.UTF_8));
        mqttMessage.setQos(qos);
        mqttMessage.setRetained(false);
        mqttClient.publish(topic, mqttMessage);
        logger.info("Published MQTT control message to {}", topic);
    }

    public void subscribe(String topic, int qos) throws MqttException {
        if (!isConnected()) {
            throw new IllegalStateException("EMQX broker is not connected");
        }
        mqttClient.subscribe(topic, qos);
    }

    public void unsubscribe(String topic) throws MqttException {
        if (!isConnected()) {
            throw new IllegalStateException("EMQX broker is not connected");
        }
        mqttClient.unsubscribe(topic);
    }

    public void disconnect() throws MqttException {
        if (isConnected()) {
            mqttClient.disconnect();
        }
    }

    public boolean isConnected() {
        return mqttClient != null && mqttClient.isConnected();
    }

    public String getClientId() {
        return mqttClient == null ? null : mqttClient.getClientId();
    }

    public String getServerUri() {
        return mqttClient == null ? null : mqttClient.getServerURI();
    }
}
