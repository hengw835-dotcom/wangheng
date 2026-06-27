package com.smartharvester.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class WebSocketController {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sensor-data")
    @SendTo("/topic/sensor-data")
    public Map<String, Object> handleSensorData(Map<String, Object> data) {
        return data;
    }

    @MessageMapping("/machine-status")
    @SendTo("/topic/machine-status")
    public Map<String, Object> handleMachineStatus(Map<String, Object> status) {
        return status;
    }

    @PostMapping
    public Map<String, Object> sendNotification(@Valid @RequestBody NotificationRequest request) {
        Map<String, Object> notification = Map.of(
                "message", request.message(),
                "timestamp", Instant.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/" + request.topic(), notification);
        return notification;
    }

    public record NotificationRequest(
            @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{1,64}") String topic,
            @NotBlank @Size(max = 500) String message) {
    }
}
