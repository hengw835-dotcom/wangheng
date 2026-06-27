INSERT INTO agricultural_machine (machine_id, model, status, location, last_updated, parameters)
SELECT 'machine-001', 'Smart Harvester X1', 'WORKING', '示范田 A 区', CURRENT_TIMESTAMP, '{"fuelLevel":82,"cuttingWidth":6.5}'
WHERE NOT EXISTS (SELECT 1 FROM agricultural_machine WHERE machine_id = 'machine-001');

INSERT INTO agricultural_machine (machine_id, model, status, location, last_updated, parameters)
SELECT 'machine-002', 'Smart Harvester X2', 'IDLE', '停靠区 B', CURRENT_TIMESTAMP, '{"fuelLevel":68,"cuttingWidth":7.2}'
WHERE NOT EXISTS (SELECT 1 FROM agricultural_machine WHERE machine_id = 'machine-002');

INSERT INTO harvest_task (task_id, machine_id, field_name, start_time, end_time, status, target_area, completed_area, estimated_yield)
SELECT 'task-001', 'machine-001', '示范田 A 区', CURRENT_TIMESTAMP, NULL, 'IN_PROGRESS', 120, 46, 28
WHERE NOT EXISTS (SELECT 1 FROM harvest_task WHERE task_id = 'task-001');

INSERT INTO harvest_task (task_id, machine_id, field_name, start_time, end_time, status, target_area, completed_area, estimated_yield)
SELECT 'task-002', 'machine-002', '示范田 B 区', CURRENT_TIMESTAMP, NULL, 'PENDING', 95, 0, 21
WHERE NOT EXISTS (SELECT 1 FROM harvest_task WHERE task_id = 'task-002');

INSERT INTO sensor_data (machine_id, sensor_type, value, unit, timestamp, location)
SELECT 'machine-001', 'temperature', 26.4, '℃', CURRENT_TIMESTAMP, '示范田 A 区'
WHERE NOT EXISTS (SELECT 1 FROM sensor_data WHERE machine_id = 'machine-001' AND sensor_type = 'temperature');

INSERT INTO sensor_data (machine_id, sensor_type, value, unit, timestamp, location)
SELECT 'machine-001', 'humidity', 61.5, '%', CURRENT_TIMESTAMP, '示范田 A 区'
WHERE NOT EXISTS (SELECT 1 FROM sensor_data WHERE machine_id = 'machine-001' AND sensor_type = 'humidity');

INSERT INTO sensor_data (machine_id, sensor_type, value, unit, timestamp, location)
SELECT 'machine-001', 'speed', 6.8, 'km/h', CURRENT_TIMESTAMP, '示范田 A 区'
WHERE NOT EXISTS (SELECT 1 FROM sensor_data WHERE machine_id = 'machine-001' AND sensor_type = 'speed');
