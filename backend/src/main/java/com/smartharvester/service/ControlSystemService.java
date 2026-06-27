package com.smartharvester.service;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class ControlSystemService {

    // 自适应PID控制器
    private PIDController pidController;
    
    // 传感器数据
    private SensorData sensorData;

    public ControlSystemService() {
        // 初始化PID控制器，默认参数
        this.pidController = new PIDController(1.2, 0.5, 0.3);
        this.sensorData = new SensorData();
    }

    // 更新传感器数据
    public void updateSensorData(double speed, double rpm, double temperature, double pressure, double[] attitude) {
        sensorData.setSpeed(speed);
        sensorData.setRpm(rpm);
        sensorData.setTemperature(temperature);
        sensorData.setPressure(pressure);
        sensorData.setAttitude(attitude);
    }

    // 姿态解算（使用互补滤波）
    public double[] calculateAttitude(double[] accData, double[] gyroData, double[] magData) {
        // 实际项目中，这里会使用互补滤波或卡尔曼滤波进行姿态解算
        // 现在返回模拟数据
        double[] attitude = new double[3];
        attitude[0] = 2.5; // 横滚角
        attitude[1] = 1.2; // 俯仰角
        attitude[2] = 0.5; // 偏航角
        return attitude;
    }

    // 计算控制量
    public ControlOutput calculateControl(double targetSpeed, double currentSpeed) {
        // 使用PID控制器计算控制量
        double controlValue = pidController.calculate(targetSpeed, currentSpeed);
        
        // 生成控制输出
        ControlOutput output = new ControlOutput();
        output.setThrottle(controlValue);
        output.setSteering(0.0); // 暂时设为0
        output.setBrake(0.0); // 暂时设为0
        
        return output;
    }

    // 多传感器融合
    public SensorFusionResult fuseSensors(double[] gpsData, double[] imuData, double[] visionData) {
        // 实际项目中，这里会使用传感器融合算法
        // 现在返回模拟数据
        SensorFusionResult result = new SensorFusionResult();
        result.setPosition(new double[]{116.3, 39.9, 10.0});
        result.setVelocity(new double[]{8.5, 0.0, 0.0});
        result.setAttitude(new double[]{2.5, 1.2, 0.5});
        return result;
    }

    // 负荷逻辑模型
    public LoadModelResult calculateLoadModel(double cropDensity, double speed) {
        // 实际项目中，这里会根据作物密度和速度计算负荷
        // 现在返回模拟数据
        LoadModelResult result = new LoadModelResult();
        result.setOptimalSpeed(speed * (1 - cropDensity * 0.1));
        result.setEstimatedYield(cropDensity * speed * 10);
        result.setBlockageRisk(cropDensity > 0.8 ? "HIGH" : "LOW");
        return result;
    }

    // PID控制器类
    private static class PIDController {
        private double kp;
        private double ki;
        private double kd;
        private double integral;
        private double previousError;

        public PIDController(double kp, double ki, double kd) {
            this.kp = kp;
            this.ki = ki;
            this.kd = kd;
            this.integral = 0;
            this.previousError = 0;
        }

        public double calculate(double setpoint, double processValue) {
            double error = setpoint - processValue;
            integral += error;
            double derivative = error - previousError;
            previousError = error;
            
            return kp * error + ki * integral + kd * derivative;
        }

        public void setParameters(double kp, double ki, double kd) {
            this.kp = kp;
            this.ki = ki;
            this.kd = kd;
        }
    }

    // 传感器数据类
    private static class SensorData {
        private double speed;
        private double rpm;
        private double temperature;
        private double pressure;
        private double[] attitude;

        // Getters and Setters
        public double getSpeed() {
            return speed;
        }

        public void setSpeed(double speed) {
            this.speed = speed;
        }

        public double getRpm() {
            return rpm;
        }

        public void setRpm(double rpm) {
            this.rpm = rpm;
        }

        public double getTemperature() {
            return temperature;
        }

        public void setTemperature(double temperature) {
            this.temperature = temperature;
        }

        public double getPressure() {
            return pressure;
        }

        public void setPressure(double pressure) {
            this.pressure = pressure;
        }

        public double[] getAttitude() {
            return attitude;
        }

        public void setAttitude(double[] attitude) {
            this.attitude = attitude;
        }
    }

    // 控制输出类
    public static class ControlOutput {
        private double throttle;
        private double steering;
        private double brake;

        // Getters and Setters
        public double getThrottle() {
            return throttle;
        }

        public void setThrottle(double throttle) {
            this.throttle = throttle;
        }

        public double getSteering() {
            return steering;
        }

        public void setSteering(double steering) {
            this.steering = steering;
        }

        public double getBrake() {
            return brake;
        }

        public void setBrake(double brake) {
            this.brake = brake;
        }
    }

    // 传感器融合结果类
    public static class SensorFusionResult {
        private double[] position;
        private double[] velocity;
        private double[] attitude;

        // Getters and Setters
        public double[] getPosition() {
            return position;
        }

        public void setPosition(double[] position) {
            this.position = position;
        }

        public double[] getVelocity() {
            return velocity;
        }

        public void setVelocity(double[] velocity) {
            this.velocity = velocity;
        }

        public double[] getAttitude() {
            return attitude;
        }

        public void setAttitude(double[] attitude) {
            this.attitude = attitude;
        }
    }

    // 负荷模型结果类
    public static class LoadModelResult {
        private double optimalSpeed;
        private double estimatedYield;
        private String blockageRisk;

        // Getters and Setters
        public double getOptimalSpeed() {
            return optimalSpeed;
        }

        public void setOptimalSpeed(double optimalSpeed) {
            this.optimalSpeed = optimalSpeed;
        }

        public double getEstimatedYield() {
            return estimatedYield;
        }

        public void setEstimatedYield(double estimatedYield) {
            this.estimatedYield = estimatedYield;
        }

        public String getBlockageRisk() {
            return blockageRisk;
        }

        public void setBlockageRisk(String blockageRisk) {
            this.blockageRisk = blockageRisk;
        }
    }
}