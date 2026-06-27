package com.smartharvester.service;

import com.smartharvester.entity.AgriculturalMachine;
import com.smartharvester.repository.AgriculturalMachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AgriculturalMachineService {
    @Autowired
    private AgriculturalMachineRepository machineRepository;

    public List<AgriculturalMachine> getAllMachines() {
        return machineRepository.findAll();
    }

    public AgriculturalMachine getMachineByMachineId(String machineId) {
        return machineRepository.findByMachineId(machineId);
    }

    public AgriculturalMachine saveMachine(AgriculturalMachine machine) {
        machine.setLastUpdated(new Date());
        return machineRepository.save(machine);
    }

    public AgriculturalMachine updateMachine(String machineId, AgriculturalMachine update) {
        AgriculturalMachine machine = requireMachine(machineId);
        machine.setModel(update.getModel());
        machine.setStatus(update.getStatus());
        machine.setLocation(update.getLocation());
        machine.setParameters(update.getParameters());
        machine.setLastUpdated(new Date());
        return machineRepository.save(machine);
    }

    public AgriculturalMachine updateMachineStatus(String machineId, String status) {
        AgriculturalMachine machine = requireMachine(machineId);
        machine.setStatus(status);
        machine.setLastUpdated(new Date());
        return machineRepository.save(machine);
    }

    public void deleteMachine(Long id) {
        machineRepository.deleteById(id);
    }

    public void deleteMachineByMachineId(String machineId) {
        machineRepository.delete(requireMachine(machineId));
    }

    private AgriculturalMachine requireMachine(String machineId) {
        AgriculturalMachine machine = machineRepository.findByMachineId(machineId);
        if (machine == null) {
            throw new NoSuchElementException("Machine not found: " + machineId);
        }
        return machine;
    }
}
