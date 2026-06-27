package com.smartharvester.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "harvest_task")
public class HarvestTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "task_id", unique = true, nullable = false)
    private String taskId;
    
    @Column(name = "machine_id")
    @NotBlank
    @Size(max = 64)
    private String machineId;
    
    @Column(name = "field_name")
    @NotBlank
    @Size(max = 100)
    private String fieldName;
    
    @Column(name = "start_time")
    private Date startTime;
    
    @Column(name = "end_time")
    private Date endTime;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "target_area")
    @Positive
    private double targetArea;
    
    @Column(name = "completed_area")
    @PositiveOrZero
    private double completedArea;
    
    @Column(name = "estimated_yield")
    @PositiveOrZero
    private double estimatedYield;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getMachineId() {
        return machineId;
    }

    public void setMachineId(String machineId) {
        this.machineId = machineId;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTargetArea() {
        return targetArea;
    }

    public void setTargetArea(double targetArea) {
        this.targetArea = targetArea;
    }

    public double getCompletedArea() {
        return completedArea;
    }

    public void setCompletedArea(double completedArea) {
        this.completedArea = completedArea;
    }

    public double getEstimatedYield() {
        return estimatedYield;
    }

    public void setEstimatedYield(double estimatedYield) {
        this.estimatedYield = estimatedYield;
    }
}
