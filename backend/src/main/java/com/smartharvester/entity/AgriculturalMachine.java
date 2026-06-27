package com.smartharvester.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "agricultural_machine")
public class AgriculturalMachine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "machine_id", unique = true, nullable = false)
    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9_-]{1,64}")
    private String machineId;
    
    @Column(name = "model")
    @NotBlank
    @Size(max = 100)
    private String model;
    
    @Column(name = "status")
    @Pattern(regexp = "ONLINE|OFFLINE|WORKING|IDLE|MAINTENANCE|ERROR|PAUSED|STOPPED")
    private String status;
    
    @Column(name = "location")
    @Size(max = 100)
    private String location;
    
    @Column(name = "last_updated")
    private Date lastUpdated;
    
    @Column(name = "parameters")
    private String parameters;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMachineId() {
        return machineId;
    }

    public void setMachineId(String machineId) {
        this.machineId = machineId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getParameters() {
        return parameters;
    }

    public void setParameters(String parameters) {
        this.parameters = parameters;
    }
}
