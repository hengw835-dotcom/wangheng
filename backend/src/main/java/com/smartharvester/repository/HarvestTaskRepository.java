package com.smartharvester.repository;

import com.smartharvester.entity.HarvestTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HarvestTaskRepository extends JpaRepository<HarvestTask, Long> {
    HarvestTask findByTaskId(String taskId);
    List<HarvestTask> findByMachineId(String machineId);
    List<HarvestTask> findByStatus(String status);
}