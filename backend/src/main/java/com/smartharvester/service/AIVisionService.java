package com.smartharvester.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class AIVisionService {

    // 模拟AI模型推理
    public List<DetectionResult> detectObjects(MultipartFile image) {
        // 实际项目中，这里会加载YOLO模型并进行推理
        // 现在返回模拟数据
        List<DetectionResult> results = new ArrayList<>();
        
        // 模拟检测到的目标
        results.add(new DetectionResult("作物", 0.95, 100, 150, 80, 100));
        results.add(new DetectionResult("作物", 0.92, 200, 180, 90, 110));
        results.add(new DetectionResult("障碍物", 0.85, 350, 200, 60, 70));
        
        return results;
    }

    // 计算产量分布
    public double[][] calculateYieldDistribution(String fieldId) {
        // 实际项目中，这里会根据AI识别结果和传感器数据计算产量分布
        // 现在返回模拟数据
        double[][] distribution = new double[5][5];
        Random random = new Random();
        
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                distribution[i][j] = 30 + random.nextDouble() * 60; // 30-90之间的随机值
            }
        }
        
        return distribution;
    }

    // 检测结果类
    public static class DetectionResult {
        private String label;
        private double confidence;
        private int x;
        private int y;
        private int width;
        private int height;

        public DetectionResult(String label, double confidence, int x, int y, int width, int height) {
            this.label = label;
            this.confidence = confidence;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        // Getters
        public String getLabel() {
            return label;
        }

        public double getConfidence() {
            return confidence;
        }

        public int getX() {
            return x;
        }

        public int getY() {
            return y;
        }

        public int getWidth() {
            return width;
        }

        public int getHeight() {
            return height;
        }
    }
}