package com.smartharvester.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartharvester.entity.ControlCommandAudit;
import com.smartharvester.repository.ControlCommandAuditRepository;
import com.smartharvester.service.MQTTService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/emqx")
public class EmqxControlController {
    private static final Set<String> ALLOWED_COMMANDS =
            Set.of("START", "PAUSE", "RESUME", "STOP", "APPLY_PARAMS");

    private final MQTTService mqttService;
    private final ObjectMapper objectMapper;
    private final ControlCommandAuditRepository auditRepository;

    @Value("${mqtt.broker}")
    private String configuredBroker;

    @Value("${mqtt.clientId}")
    private String configuredClientId;

    public EmqxControlController(
            MQTTService mqttService,
            ObjectMapper objectMapper,
            ControlCommandAuditRepository auditRepository) {
        this.mqttService = mqttService;
        this.objectMapper = objectMapper;
        this.auditRepository = auditRepository;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "connected", mqttService.isConnected(),
                "broker", mqttService.getServerUri() == null ? configuredBroker : mqttService.getServerUri(),
                "clientId", mqttService.getClientId() == null ? configuredClientId : mqttService.getClientId()
        );
    }

    @PostMapping("/machines/{machineId}/control")
    public Map<String, Object> publishControl(
            @org.springframework.web.bind.annotation.PathVariable String machineId,
            @RequestHeader("Idempotency-Key") @Size(min = 8, max = 128) String idempotencyKey,
            @Valid @RequestBody ControlRequest request,
            Authentication authentication) throws MqttException, JsonProcessingException {
        validateMachineId(machineId);
        ControlCommandAudit existing = auditRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) {
            return response(existing, true);
        }

        String command = request.command().toUpperCase();
        if (!ALLOWED_COMMANDS.contains(command)) {
            throw new IllegalArgumentException("Unsupported control command: " + command);
        }

        String commandId = UUID.randomUUID().toString();
        String topic = "harvester/" + machineId + "/control";
        Map<String, Object> payload = Map.of(
                "commandId", commandId,
                "machineId", machineId,
                "command", command,
                "parameters", request.parameters() == null ? Map.of() : request.parameters(),
                "timestamp", Instant.now().toString()
        );

        ControlCommandAudit audit = new ControlCommandAudit();
        audit.setCommandId(commandId);
        audit.setIdempotencyKey(idempotencyKey);
        audit.setOperatorName(authentication.getName());
        audit.setMachineId(machineId);
        audit.setCommandName(command);
        audit.setTopic(topic);
        audit.setPayload(objectMapper.writeValueAsString(payload));
        audit.setStatus("PENDING");
        audit.setCreatedAt(Instant.now());
        auditRepository.save(audit);

        try {
            mqttService.publish(topic, audit.getPayload(), 1);
            audit.setStatus("PUBLISHED");
            auditRepository.save(audit);
            return response(audit, false);
        } catch (RuntimeException | MqttException exception) {
            audit.setStatus("FAILED");
            audit.setErrorMessage(exception.getMessage());
            auditRepository.save(audit);
            throw exception;
        }
    }

    @PostMapping("/control-acks")
    public Map<String, Object> acknowledge(@Valid @RequestBody AcknowledgementRequest request)
            throws JsonProcessingException {
        ControlCommandAudit audit = auditRepository.findByCommandId(request.commandId())
                .orElseThrow(() -> new NoSuchElementException("Control command not found: " + request.commandId()));
        audit.setStatus(request.success() ? "ACKNOWLEDGED" : "REJECTED");
        audit.setAcknowledgedAt(Instant.now());
        audit.setAcknowledgement(objectMapper.writeValueAsString(request));
        auditRepository.save(audit);
        return response(audit, false);
    }

    @GetMapping("/control-audits")
    public List<ControlCommandAudit> audits() {
        return auditRepository.findTop100ByOrderByCreatedAtDesc();
    }

    @GetMapping("/control-audits/by-command")
    public ControlCommandAudit audit(@RequestParam String commandId) {
        return auditRepository.findByCommandId(commandId)
                .orElseThrow(() -> new NoSuchElementException("Control command not found: " + commandId));
    }

    private Map<String, Object> response(ControlCommandAudit audit, boolean duplicate) {
        return Map.of(
                "commandId", audit.getCommandId(),
                "published", "PUBLISHED".equals(audit.getStatus()) || "ACKNOWLEDGED".equals(audit.getStatus()),
                "status", audit.getStatus(),
                "topic", audit.getTopic(),
                "command", audit.getCommandName(),
                "duplicate", duplicate
        );
    }

    private void validateMachineId(String machineId) {
        if (!machineId.matches("[A-Za-z0-9_-]{1,64}")) {
            throw new IllegalArgumentException("Invalid machine id");
        }
    }

    public record ControlRequest(@NotBlank String command, Map<String, Object> parameters) {
    }

    public record AcknowledgementRequest(
            @NotBlank String commandId,
            boolean success,
            @Size(max = 500) String message) {
    }
}
