package com.smartharvester.config;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CorsHeaderConfigTest {

    @Test
    void corsAllowsFrontendRequestIdHeader() throws Exception {
        String source = Files.readString(Path.of("src/main/java/com/smartharvester/config/SecurityConfig.java"));

        assertTrue(source.contains("X-Request-ID"));
    }
}
