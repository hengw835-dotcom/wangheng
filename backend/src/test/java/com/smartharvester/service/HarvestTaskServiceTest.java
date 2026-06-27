package com.smartharvester.service;

import com.smartharvester.entity.HarvestTask;
import com.smartharvester.repository.HarvestTaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HarvestTaskServiceTest {

    @Mock
    private HarvestTaskRepository repository;

    @InjectMocks
    private HarvestTaskService service;

    @Test
    void createTaskInitializesLifecycleFields() {
        HarvestTask task = new HarvestTask();
        task.setFieldName("Field A");
        when(repository.save(task)).thenReturn(task);

        HarvestTask result = service.createTask(task);

        assertNotNull(result.getTaskId());
        assertNotNull(result.getStartTime());
        assertEquals("PENDING", result.getStatus());
        assertEquals(0.0, result.getCompletedArea());
    }
}
