package com.smartharvester.repository;

import com.smartharvester.entity.ControlCommandAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ControlCommandAuditRepository extends JpaRepository<ControlCommandAudit, Long> {
    Optional<ControlCommandAudit> findByIdempotencyKey(String idempotencyKey);
    Optional<ControlCommandAudit> findByCommandId(String commandId);
    List<ControlCommandAudit> findTop100ByOrderByCreatedAtDesc();
}
