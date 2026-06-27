package com.smartharvester.repository;

import com.smartharvester.entity.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Date;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    List<SensorData> findByMachineId(String machineId);
    List<SensorData> findByMachineIdAndSensorType(String machineId, String sensorType);

    @Query("SELECT DISTINCT s.machineId FROM SensorData s ORDER BY s.machineId")
    List<String> findDistinctMachineIds();
    
    @Query("SELECT s FROM SensorData s WHERE s.machineId = ?1 AND s.timestamp BETWEEN ?2 AND ?3")
    List<SensorData> findByMachineIdAndTimestampBetween(String machineId, Date start, Date end);
}
