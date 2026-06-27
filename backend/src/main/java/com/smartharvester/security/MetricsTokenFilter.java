package com.smartharvester.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;

@Component
public class MetricsTokenFilter extends OncePerRequestFilter {
    private final byte[] expectedAuthorization;
    private final ObjectMapper objectMapper;

    public MetricsTokenFilter(@Value("${app.security.metrics-token}") String token, ObjectMapper objectMapper) {
        if (token == null || token.length() < 24) {
            throw new IllegalStateException("METRICS_TOKEN must contain at least 24 characters");
        }
        this.expectedAuthorization = ("Bearer " + token).getBytes(StandardCharsets.UTF_8);
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"/actuator/prometheus".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        byte[] supplied = request.getHeader("Authorization") == null
                ? new byte[0]
                : request.getHeader("Authorization").getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expectedAuthorization, supplied)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), Map.of(
                    "code", "UNAUTHORIZED",
                    "message", "A valid metrics token is required",
                    "timestamp", Instant.now().toString()
            ));
            return;
        }
        chain.doFilter(new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                return "Authorization".equalsIgnoreCase(name) ? null : super.getHeader(name);
            }
        }, response);
    }
}
