-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_harvester;

USE smart_harvester;

-- 农机设备表
CREATE TABLE IF NOT EXISTS agricultural_machine (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    machine_id VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100),
    status VARCHAR(20),
    location VARCHAR(100),
    last_updated DATETIME,
    parameters TEXT
);

-- 传感器数据表
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    machine_id VARCHAR(50) NOT NULL,
    sensor_type VARCHAR(50),
    value DOUBLE,
    unit VARCHAR(20),
    timestamp DATETIME,
    location VARCHAR(100)
);

-- 收割任务表
CREATE TABLE IF NOT EXISTS harvest_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    machine_id VARCHAR(50),
    field_name VARCHAR(100),
    start_time DATETIME,
    end_time DATETIME,
    status VARCHAR(20),
    target_area DOUBLE,
    completed_area DOUBLE,
    estimated_yield DOUBLE
);

-- 插入示例数据
INSERT INTO agricultural_machine (machine_id, model, status, location, last_updated, parameters) VALUES
('machine-001', 'John Deere S780', 'ONLINE', '东地块', NOW(), '{"engine_hours": 1200, "fuel_level": 85, "cutting_width": 12}'),
('machine-002', 'Case IH Axial-Flow 9240', 'OFFLINE', '西地块', NOW(), '{"engine_hours": 850, "fuel_level": 60, "cutting_width": 10}'),
('machine-003', 'New Holland CR10.90', 'WORKING', '南地块', NOW(), '{"engine_hours": 1500, "fuel_level": 90, "cutting_width": 14}');

INSERT INTO harvest_task (task_id, machine_id, field_name, start_time, end_time, status, target_area, completed_area, estimated_yield) VALUES
('task-001', 'machine-001', '东地块', NOW() - INTERVAL 2 HOUR, NULL, 'IN_PROGRESS', 100, 45, 25),
('task-002', 'machine-002', '西地块', NOW() - INTERVAL 1 HOUR, NULL, 'PENDING', 80, 0, 20),
('task-003', 'machine-003', '南地块', NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 30 MINUTE, 'COMPLETED', 75, 75, 18);

INSERT INTO sensor_data (machine_id, sensor_type, value, unit, timestamp, location) VALUES
('machine-001', 'speed', 8.5, 'km/h', NOW(), '东地块'),
('machine-001', 'temperature', 65, '℃', NOW(), '东地块'),
('machine-001', 'humidity', 55, '%', NOW(), '东地块'),
('machine-003', 'speed', 10.2, 'km/h', NOW(), '南地块'),
('machine-003', 'temperature', 68, '℃', NOW(), '南地块'),
('machine-003', 'humidity', 50, '%', NOW(), '南地块');