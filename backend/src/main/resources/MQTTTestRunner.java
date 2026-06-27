package com.smartharvester.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.smartharvester.service.MQTTService;

@Component
public class MQTTTestRunner implements CommandLineRunner {

    @Autowired
    private MQTTService mqttService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== MQTT 连接测试 ===");
        System.out.println("连接状态：" + mqttService.isConnected());
        System.out.println("客户端 ID: " + mqttService.getClientId());
        System.out.println("服务器地址：" + mqttService.getServerUri());
        
        // 发送测试消息
        if (mqttService.isConnected()) {
            System.out.println("\n发送测试消息...");
            mqttService.publish("harvester/test", "Hello from Smart Harvester!");
            System.out.println("测试消息已发送！");
        }
    }
}
