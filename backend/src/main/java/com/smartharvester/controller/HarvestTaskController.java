package com.smartharvester.controller;

import com.smartharvester.entity.HarvestTask;
import com.smartharvester.service.HarvestTaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class HarvestTaskController {
    @Autowired
    private HarvestTaskService taskService;

    @GetMapping
    public List<HarvestTask> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{taskId}")
    public HarvestTask getTask(@PathVariable String taskId) {
        return taskService.getTaskByTaskId(taskId);
    }

    @GetMapping("/machine/{machineId}")
    public List<HarvestTask> getTasksByMachineId(@PathVariable String machineId) {
        return taskService.getTasksByMachineId(machineId);
    }

    @GetMapping("/status/{status}")
    public List<HarvestTask> getTasksByStatus(@PathVariable String status) {
        return taskService.getTasksByStatus(status);
    }

    @PostMapping
    public HarvestTask createTask(@Valid @RequestBody HarvestTask task) {
        return taskService.createTask(task);
    }

    @PutMapping("/{taskId}/status")
    public HarvestTask updateTaskStatus(@PathVariable String taskId, @RequestBody String status) {
        return taskService.updateTaskStatus(taskId, status);
    }

    @PutMapping("/{taskId}/progress")
    public HarvestTask updateTaskProgress(@PathVariable String taskId, @RequestParam double completedArea) {
        return taskService.updateTaskProgress(taskId, completedArea);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable String taskId) {
        taskService.deleteTaskByTaskId(taskId);
    }
}
