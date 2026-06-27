package com.smartharvester.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/capabilities")
public class CapabilityController {

    @Value("${app.capabilities.ai-vision}")
    private String aiVisionMode;

    @Value("${app.capabilities.navigation}")
    private String navigationMode;

    @Value("${app.capabilities.control}")
    private String controlMode;

    @GetMapping
    public Map<String, String> getCapabilities() {
        return Map.of(
                "aiVision", aiVisionMode,
                "navigation", navigationMode,
                "control", controlMode
        );
    }
}
