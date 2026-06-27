package com.smartharvester.service;

import com.smartharvester.entity.AgriculturalMachine;
import com.smartharvester.repository.AgriculturalMachineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgriculturalMachineServiceTest {

    @Mock
    private AgriculturalMachineRepository repository;

    @InjectMocks
    private AgriculturalMachineService service;

    @Test
    void updateMachinePersistsEditableFields() {
        AgriculturalMachine existing = new AgriculturalMachine();
        existing.setMachineId("HM-01");
        AgriculturalMachine update = new AgriculturalMachine();
        update.setModel("Updated model");
        update.setStatus("WORKING");
        update.setLocation("Field A");
        update.setParameters("{}");

        when(repository.findByMachineId("HM-01")).thenReturn(existing);
        when(repository.save(existing)).thenReturn(existing);

        AgriculturalMachine result = service.updateMachine("HM-01", update);

        assertEquals("Updated model", result.getModel());
        assertEquals("WORKING", result.getStatus());
        assertNotNull(result.getLastUpdated());
        verify(repository).save(existing);
    }

    @Test
    void updateMissingMachineReturnsNotFoundError() {
        when(repository.findByMachineId("missing")).thenReturn(null);

        assertThrows(NoSuchElementException.class,
                () -> service.updateMachineStatus("missing", "ONLINE"));
    }
}
