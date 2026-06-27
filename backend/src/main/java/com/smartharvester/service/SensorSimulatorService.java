package com.smartharvester.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SensorSimulatorService {
    private final MQTTService mqttService;
    private final ObjectMapper objectMapper;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final AtomicLong publishedCount = new AtomicLong();
    private volatile String machineId = "SIM-001";

    public SensorSimulatorService(MQTTService mqttService, ObjectMapper objectMapper) {
        this.mqttService = mqttService;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> start(String requestedMachineId) {
        machineId = requestedMachineId;
        running.set(true);
        return status();
    }

    public Map<String, Object> stop() {
        running.set(false);
        return status();
    }

    public Map<String, Object> publishOnce(String requestedMachineId) throws MqttException, JsonProcessingException {
        machineId = requestedMachineId;
        publishBatch();
        return status();
    }

    public Map<String, Object> publishReading(
            String requestedMachineId, String sensorType, double value, String unit, String location)
            throws MqttException, JsonProcessingException {
        machineId = requestedMachineId;
        publish(requestedMachineId, sensorType, value, unit, location);
        return status();
    }

    public Map<String, Object> status() {
        return Map.of(
                "running", running.get(),
                "machineId", machineId,
                "topic", "harvester/" + machineId + "/sensor",
                "publishedCount", publishedCount.get(),
                "mqttConnected", mqttService.isConnected()
        );
    }

    @Scheduled(fixedDelayString = "${app.sensor-simulator.interval-ms:5000}")
    public void scheduledPublish() throws MqttException, JsonProcessingException {
        if (running.get()) {
            publishBatch();
        }
    }

    private void publishBatch() throws MqttException, JsonProcessingException {
        List<Reading> readings = List.of(
                new Reading("temperature", random(18, 38), "C"),
                new Reading("humidity", random(35, 85), "%"),
                new Reading("engine_rpm", random(900, 2200), "rpm"),
                new Reading("speed", random(0, 12), "km/h")
        );

        for (Reading reading : readings) {
            publish(machineId, reading.type(), reading.value(), reading.unit(), "simulator");
        }
    }

    private void publish(String targetMachineId, String sensorType, double value, String unit, String location)
            throws JsonProcessingException, MqttException {
        Map<String, Object> payload = Map.of(
                "sensorType", sensorType,
                "value", value,
                "unit", unit == null ? "" : unit,
                "location", location == null ? "simulator" : location,
                "timestamp", Instant.now().toEpochMilli()
        );
        mqttService.publish("harvester/" + targetMachineId + "/sensor", objectMapper.writeValueAsString(payload), 1);
        publishedCount.incrementAndGet();
    }

    private double random(double min, double max) {
        return Math.round(ThreadLocalRandom.current().nextDouble(min, max) * 100.0) / 100.0;
    }

    private record Reading(String type, double value, String unit) {
    }
}
