package com.smartharvester.controller;

import com.smartharvester.service.ControlSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/control-system")
public class ControlSystemController {
    @Autowired
    private ControlSystemService controlSystemService;

    @PostMapping("/update-sensor-data")
    public void updateSensorData(
            @RequestParam double speed,
            @RequestParam double rpm,
            @RequestParam double temperature,
            @RequestParam double pressure,
            @RequestParam double[] attitude) {
        controlSystemService.updateSensorData(speed, rpm, temperature, pressure, attitude);
    }

    @PostMapping("/calculate-attitude")
    public double[] calculateAttitude(
            @RequestParam double[] accData,
            @RequestParam double[] gyroData,
            @RequestParam double[] magData) {
        return controlSystemService.calculateAttitude(accData, gyroData, magData);
    }

    @PostMapping("/calculate-control")
    public ControlSystemService.ControlOutput calculateControl(
            @RequestParam double targetSpeed,
            @RequestParam double currentSpeed) {
        return controlSystemService.calculateControl(targetSpeed, currentSpeed);
    }

    @PostMapping("/fuse-sensors")
    public ControlSystemService.SensorFusionResult fuseSensors(
            @RequestParam double[] gpsData,
            @RequestParam double[] imuData,
            @RequestParam double[] visionData) {
        return controlSystemService.fuseSensors(gpsData, imuData, visionData);
    }

    @PostMapping("/calculate-load-model")
    public ControlSystemService.LoadModelResult calculateLoadModel(
            @RequestParam double cropDensity,
            @RequestParam double speed) {
        return controlSystemService.calculateLoadModel(cropDensity, speed);
    }
}