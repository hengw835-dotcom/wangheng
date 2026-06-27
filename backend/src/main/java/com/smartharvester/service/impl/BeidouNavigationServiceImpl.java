package com.smartharvester.service.impl;

import com.smartharvester.service.BeidouNavigationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BeidouNavigationServiceImpl implements BeidouNavigationService {

    @Override
    public Map<String, Object> getSatelliteStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("satelliteCount", 12);
        
        List<Map<String, Object>> satellites = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            Map<String, Object> satellite = new HashMap<>();
            satellite.put("id", i);
            satellite.put("signal", 30 + (int)(Math.random() * 20));
            satellites.add(satellite);
        }
        
        response.put("satellites", satellites);
        response.put("positionAccuracy", 1.2);
        return response;
    }

    @Override
    public Map<String, Object> planRoute(Map<String, Object> routeParams) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("routeLength", 5.2);
        response.put("estimatedTime", 15);
        response.put("waypoints", 3);
        response.put("planningMode", routeParams.get("planningMode"));
        
        // 模拟路线坐标
        List<Map<String, Object>> routeCoordinates = new ArrayList<>();
        routeCoordinates.add(Map.of("lat", 39.9042, "lng", 116.4074));
        routeCoordinates.add(Map.of("lat", 39.9142, "lng", 116.4174));
        routeCoordinates.add(Map.of("lat", 39.9242, "lng", 116.4274));
        routeCoordinates.add(Map.of("lat", 39.9342, "lng", 116.4374));
        
        response.put("routeCoordinates", routeCoordinates);
        return response;
    }

    @Override
    public Map<String, Object> startNavigation(Map<String, Object> navigationParams) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "导航已开始");
        response.put("navigationId", "nav-" + System.currentTimeMillis());
        return response;
    }

    @Override
    public Map<String, Object> getRealtimePosition(String machineId) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("machineId", machineId);
        response.put("lat", 39.9042 + (Math.random() * 0.1));
        response.put("lng", 116.4074 + (Math.random() * 0.1));
        response.put("speed", 8.5);
        response.put("direction", 180);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @Override
    public Map<String, Object> getNavigationHistory(String machineId) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("machineId", machineId);
        
        List<Map<String, Object>> history = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Map<String, Object> record = new HashMap<>();
            record.put("timestamp", System.currentTimeMillis() - (i * 3600000));
            record.put("lat", 39.9042 + (Math.random() * 0.1));
            record.put("lng", 116.4074 + (Math.random() * 0.1));
            record.put("speed", 5 + (Math.random() * 10));
            history.add(record);
        }
        
        response.put("history", history);
        return response;
    }
}
