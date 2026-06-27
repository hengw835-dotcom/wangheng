package com.smartharvester.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartharvester.entity.SensorData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MqttSensorMessageHandler {
    private static final Logger logger = LoggerFactory.getLogger(MqttSensorMessageHandler.class);
    private static final Pattern SENSOR_TOPIC = Pattern.compile("^harvester/([^/]+)/sensor$");

    private final ObjectMapper objectMapper;
    private final SensorDataService sensorDataService;

    public MqttSensorMessageHandler(ObjectMapper objectMapper, SensorDataService sensorDataService) {
        this.objectMapper = objectMapper;
        this.sensorDataService = sensorDataService;
    }

    public void handle(String topic, String payload) {
        Matcher matcher = SENSOR_TOPIC.matcher(topic);
        if (!matcher.matches()) {
            return;
        }

        try {
            SensorMessage message = objectMapper.readValue(payload, SensorMessage.class);
            if (message.sensorType() == null || message.sensorType().isBlank()) {
                throw new IllegalArgumentException("sensorType is required");
            }

            SensorData sensorData = new SensorData();
            sensorData.setMachineId(matcher.group(1));
            sensorData.setSensorType(message.sensorType());
            sensorData.setValue(message.value());
            sensorData.setUnit(message.unit());
            sensorData.setLocation(message.location());
            sensorData.setTimestamp(message.timestamp() == null ? new Date() : new Date(message.timestamp()));
            SensorData saved = sensorDataService.saveSensorData(sensorData);
            logger.info("Stored MQTT sensor data id={} machine={} type={}",
                    saved.getId(), saved.getMachineId(), saved.getSensorType());
        } catch (Exception e) {
            logger.warn("Rejected invalid MQTT sensor message on {}: {}", topic, e.getMessage());
        }
    }

    public record SensorMessage(
            String sensorType,
            double value,
            String unit,
            String location,
            Long timestamp
    ) {
    }
}
