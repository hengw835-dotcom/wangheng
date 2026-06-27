package com.smartharvester.controller;

import com.smartharvester.entity.SensorData;
import com.smartharvester.service.SensorDataService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/sensor-data")
public class SensorDataController {
    @Autowired
    private SensorDataService sensorDataService;

    @PostMapping
    public SensorData createSensorData(@Valid @RequestBody SensorData sensorData) {
        return sensorDataService.saveSensorData(sensorData);
    }

    @GetMapping("/machines")
    public List<String> getMachineIds() {
        return sensorDataService.getMachineIds();
    }

    @GetMapping("/machine/{machineId}")
    public List<SensorData> getSensorDataByMachineId(@PathVariable String machineId) {
        return sensorDataService.getSensorDataByMachineId(machineId);
    }

    @GetMapping("/machine/{machineId}/type/{sensorType}")
    public List<SensorData> getSensorDataByMachineIdAndType(@PathVariable String machineId, @PathVariable String sensorType) {
        return sensorDataService.getSensorDataByMachineIdAndType(machineId, sensorType);
    }

    @GetMapping("/machine/{machineId}/time-range")
    public List<SensorData> getSensorDataByTimeRange(
            @PathVariable String machineId,
            @RequestParam Date start,
            @RequestParam Date end) {
        return sensorDataService.getSensorDataByMachineIdAndTimeRange(machineId, start, end);
    }

    @DeleteMapping("/{id}")
    public void deleteSensorData(@PathVariable Long id) {
        sensorDataService.deleteSensorData(id);
    }
}
