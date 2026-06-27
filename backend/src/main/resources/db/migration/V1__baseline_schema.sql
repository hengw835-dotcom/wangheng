CREATE TABLE IF NOT EXISTS agricultural_machine (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    machine_id VARCHAR(64) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(20),
    location VARCHAR(100),
    last_updated DATETIME(6),
    parameters TEXT
);

CREATE TABLE IF NOT EXISTS harvest_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    machine_id VARCHAR(64) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    start_time DATETIME(6),
    end_time DATETIME(6),
    status VARCHAR(20),
    target_area DOUBLE NOT NULL,
    completed_area DOUBLE NOT NULL,
    estimated_yield DOUBLE NOT NULL
);

CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    machine_id VARCHAR(64) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    value DOUBLE NOT NULL,
    unit VARCHAR(20),
    timestamp DATETIME(6),
    location VARCHAR(100),
    INDEX idx_sensor_machine_time (machine_id, timestamp),
    INDEX idx_sensor_machine_type (machine_id, sensor_type)
);

CREATE TABLE IF NOT EXISTS control_command_audit (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    command_id VARCHAR(36) UNIQUE NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    machine_id VARCHAR(64) NOT NULL,
    command_name VARCHAR(32) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    error_message VARCHAR(500),
    created_at DATETIME(6) NOT NULL,
    acknowledged_at DATETIME(6),
    acknowledgement TEXT,
    INDEX idx_control_machine_created (machine_id, created_at),
    INDEX idx_control_status (status)
);
