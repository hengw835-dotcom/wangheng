package com.smartharvester.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DemoProfileConfigTest {

    @Test
    void demoProfileUsesRenderPortAndLocalH2Storage() throws IOException {
        String yaml = readDemoProfile();

        assertTrue(yaml.contains("port: ${PORT:8086}"));
        assertTrue(yaml.contains("jdbc:h2:file:./data/smart_harvester_demo"));
        assertTrue(yaml.contains("driver-class-name: org.h2.Driver"));
        assertTrue(yaml.contains("dialect: org.hibernate.dialect.H2Dialect"));
    }

    @Test
    void demoProfileDefaultsExternalIntegrationsToDemoSafeValues() throws IOException {
        String yaml = readDemoProfile();

        assertTrue(yaml.contains("ai-vision: ${AI_VISION_MODE:demo}"));
        assertTrue(yaml.contains("navigation: ${NAVIGATION_MODE:demo}"));
        assertTrue(yaml.contains("control: ${CONTROL_MODE:demo}"));
        assertTrue(yaml.contains("broker: ${MQTT_BROKER:tcp://127.0.0.1:1883}"));
        assertTrue(yaml.contains("redis:"));
        assertTrue(yaml.contains("enabled: false"));
    }

    private String readDemoProfile() throws IOException {
        InputStream stream = getClass().getClassLoader().getResourceAsStream("application-demo.yml");
        assertNotNull(stream, "application-demo.yml should exist");
        try (stream) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
