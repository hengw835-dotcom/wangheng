package com.smartharvester.controller;

import com.smartharvester.entity.AgriculturalMachine;
import com.smartharvester.service.AgriculturalMachineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/machines")
public class AgriculturalMachineController {
    @Autowired
    private AgriculturalMachineService machineService;

    @GetMapping
    public List<AgriculturalMachine> getAllMachines() {
        return machineService.getAllMachines();
    }

    @GetMapping("/{machineId}")
    public AgriculturalMachine getMachine(@PathVariable String machineId) {
        return machineService.getMachineByMachineId(machineId);
    }

    @PostMapping
    public AgriculturalMachine createMachine(@Valid @RequestBody AgriculturalMachine machine) {
        return machineService.saveMachine(machine);
    }

    @PutMapping("/{machineId}")
    public AgriculturalMachine updateMachine(
            @PathVariable String machineId,
            @Valid @RequestBody AgriculturalMachine machine) {
        return machineService.updateMachine(machineId, machine);
    }

    @PutMapping("/{machineId}/status")
    public AgriculturalMachine updateMachineStatus(@PathVariable String machineId, @RequestBody String status) {
        return machineService.updateMachineStatus(machineId, status);
    }

    @DeleteMapping("/{machineId}")
    public void deleteMachine(@PathVariable String machineId) {
        machineService.deleteMachineByMachineId(machineId);
    }
}
