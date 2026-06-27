package com.smartharvester.service;

import java.util.Map;

public interface BeidouNavigationService {
    Map<String, Object> getSatelliteStatus();
    Map<String, Object> planRoute(Map<String, Object> routeParams);
    Map<String, Object> startNavigation(Map<String, Object> navigationParams);
    Map<String, Object> getRealtimePosition(String machineId);
    Map<String, Object> getNavigationHistory(String machineId);
}
