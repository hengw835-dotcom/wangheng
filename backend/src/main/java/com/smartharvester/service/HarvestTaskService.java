package com.smartharvester.service;

import com.smartharvester.entity.HarvestTask;
import com.smartharvester.repository.HarvestTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@Service
public class HarvestTaskService {
    private static final Set<String> VALID_STATUSES = Set.of("PENDING", "IN_PROGRESS", "COMPLETED");

    @Autowired
    private HarvestTaskRepository taskRepository;

    public List<HarvestTask> getAllTasks() {
        return taskRepository.findAll();
    }

    public HarvestTask getTaskByTaskId(String taskId) {
        return taskRepository.findByTaskId(taskId);
    }

    public List<HarvestTask> getTasksByMachineId(String machineId) {
        return taskRepository.findByMachineId(machineId);
    }

    public List<HarvestTask> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status);
    }

    public HarvestTask createTask(HarvestTask task) {
        task.setTaskId(UUID.randomUUID().toString());
        task.setStatus("PENDING");
        task.setStartTime(new Date());
        task.setCompletedArea(0.0);
        return taskRepository.save(task);
    }

    public HarvestTask updateTaskStatus(String taskId, String status) {
        HarvestTask task = requireTask(taskId);
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Unsupported task status: " + status);
        }
        task.setStatus(status);
        if (status.equals("COMPLETED")) {
            task.setEndTime(new Date());
            task.setCompletedArea(task.getTargetArea());
        }
        return taskRepository.save(task);
    }

    public HarvestTask updateTaskProgress(String taskId, double completedArea) {
        HarvestTask task = requireTask(taskId);
        if (completedArea < 0 || completedArea > task.getTargetArea()) {
            throw new IllegalArgumentException("Completed area must be between 0 and target area");
        }
        task.setCompletedArea(completedArea);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public void deleteTaskByTaskId(String taskId) {
        taskRepository.delete(requireTask(taskId));
    }

    private HarvestTask requireTask(String taskId) {
        HarvestTask task = taskRepository.findByTaskId(taskId);
        if (task == null) {
            throw new NoSuchElementException("Task not found: " + taskId);
        }
        return task;
    }
}
