package com.smartharvester.controller;

import com.smartharvester.service.BeidouNavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/beidou")
public class BeidouNavigationController {
    @Autowired
    private BeidouNavigationService navigationService;

    @GetMapping("/satellite/status")
    public Map<String, Object> getSatelliteStatus() {
        return navigationService.getSatelliteStatus();
    }

    @PostMapping("/route/plan")
    public Map<String, Object> planRoute(@RequestBody Map<String, Object> routeParams) {
        return navigationService.planRoute(routeParams);
    }

    @PostMapping("/navigation/start")
    public Map<String, Object> startNavigation(@RequestBody Map<String, Object> navigationParams) {
        return navigationService.startNavigation(navigationParams);
    }

    @GetMapping("/position/realtime")
    public Map<String, Object> getRealtimePosition(@RequestParam String machineId) {
        return navigationService.getRealtimePosition(machineId);
    }

    @GetMapping("/navigation/history")
    public Map<String, Object> getNavigationHistory(@RequestParam String machineId) {
        return navigationService.getNavigationHistory(machineId);
    }
}
