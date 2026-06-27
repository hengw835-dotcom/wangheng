package com.smartharvester.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.smartharvester.service.SensorSimulatorService;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Validated
@RestController
@RequestMapping("/sensor-simulator")
public class SensorSimulatorController {
    private final SensorSimulatorService simulatorService;

    public SensorSimulatorController(SensorSimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    @PostMapping("/start")
    public Map<String, Object> start(
            @RequestParam(defaultValue = "SIM-001")
            @Size(max = 64) @Pattern(regexp = "[A-Za-z0-9_-]+") String machineId) {
        return simulatorService.start(machineId);
    }

    @PostMapping("/stop")
    public Map<String, Object> stop() {
        return simulatorService.stop();
    }

    @PostMapping("/publish-once")
    public Map<String, Object> publishOnce(
            @RequestParam(defaultValue = "SIM-001")
            @Size(max = 64) @Pattern(regexp = "[A-Za-z0-9_-]+") String machineId)
            throws MqttException, JsonProcessingException {
        return simulatorService.publishOnce(machineId);
    }

    @PostMapping("/publish")
    public Map<String, Object> publish(@Valid @RequestBody PublishRequest request)
            throws MqttException, JsonProcessingException {
        return simulatorService.publishReading(
                request.machineId(), request.sensorType(), request.value(), request.unit(), request.location());
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return simulatorService.status();
    }

    public record PublishRequest(
            @NotBlank @Size(max = 64) @Pattern(regexp = "[A-Za-z0-9_-]+") String machineId,
            @NotBlank @Size(max = 50) @Pattern(regexp = "[A-Za-z0-9_-]+") String sensorType,
            @NotNull Double value,
            @Size(max = 20) String unit,
            @Size(max = 255) String location
    ) {
    }

}
