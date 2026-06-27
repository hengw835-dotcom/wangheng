package com.smartharvester.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;
    private final int requestLimit;
    private final long windowSeconds;

    public RateLimitFilter(
            ObjectMapper objectMapper,
            @Value("${app.security.rate-limit.requests}") int requestLimit,
            @Value("${app.security.rate-limit.window-seconds}") long windowSeconds) {
        this.objectMapper = objectMapper;
        this.requestLimit = requestLimit;
        this.windowSeconds = windowSeconds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String key = request.getRemoteAddr();
        long now = Instant.now().getEpochSecond();
        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt >= windowSeconds) {
                return new Window(now, 1);
            }
            return new Window(current.startedAt, current.count + 1);
        });
        if (window.count > requestLimit) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), Map.of(
                    "code", "RATE_LIMITED",
                    "message", "Too many requests",
                    "timestamp", Instant.now().toString()
            ));
            return;
        }
        chain.doFilter(request, response);
    }

    private record Window(long startedAt, int count) {
    }
}
