package com.smartharvester.repository;

import com.smartharvester.entity.AgriculturalMachine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgriculturalMachineRepository extends JpaRepository<AgriculturalMachine, Long> {
    AgriculturalMachine findByMachineId(String machineId);
}