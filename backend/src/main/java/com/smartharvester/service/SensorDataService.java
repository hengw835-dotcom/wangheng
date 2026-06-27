package com.smartharvester.service;

import com.smartharvester.entity.SensorData;
import com.smartharvester.repository.SensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class SensorDataService {
    @Autowired
    private SensorDataRepository sensorDataRepository;

    public SensorData saveSensorData(SensorData sensorData) {
        if (sensorData.getTimestamp() == null) {
            sensorData.setTimestamp(new Date());
        }
        return sensorDataRepository.save(sensorData);
    }

    public List<SensorData> getSensorDataByMachineId(String machineId) {
        return sensorDataRepository.findByMachineId(machineId);
    }

    public List<String> getMachineIds() {
        return sensorDataRepository.findDistinctMachineIds();
    }

    public List<SensorData> getSensorDataByMachineIdAndType(String machineId, String sensorType) {
        return sensorDataRepository.findByMachineIdAndSensorType(machineId, sensorType);
    }

    public List<SensorData> getSensorDataByMachineIdAndTimeRange(String machineId, Date start, Date end) {
        return sensorDataRepository.findByMachineIdAndTimestampBetween(machineId, start, end);
    }

    public void deleteSensorData(Long id) {
        sensorDataRepository.deleteById(id);
    }
}
