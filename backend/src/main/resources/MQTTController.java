package com.smartharvester.controller;

import com.smartharvester.service.MQTTService;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/mqtt")
public class MQTTController {

    @Autowired
    private MQTTService mqttService;

    // 发布消息
    @PostMapping("/publish")
    public Map<String, Object> publishMessage(
            @RequestParam String topic,
            @RequestParam String message,
            @RequestParam(defaultValue = "1") int qos) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            mqttService.publish(topic, message, qos);
            response.put("success", true);
            response.put("message", "Message published successfully");
        } catch (MqttException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    // 订阅主题
    @PostMapping("/subscribe")
    public Map<String, Object> subscribeTopic(
            @RequestParam String topic,
            @RequestParam(defaultValue = "1") int qos) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            mqttService.subscribe(topic, qos, (t, payload) -> {
                System.out.println("Received: " + payload + " on topic: " + t);
            });
            response.put("success", true);
            response.put("message", "Subscribed to topic: " + topic);
        } catch (MqttException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    // 取消订阅
    @PostMapping("/unsubscribe")
    public Map<String, Object> unsubscribeTopic(@RequestParam String topic) {
        Map<String, Object> response = new HashMap<>();
        try {
            mqttService.unsubscribe(topic);
            response.put("success", true);
            response.put("message", "Unsubscribed from topic: " + topic);
        } catch (MqttException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    // 获取连接状态
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("connected", mqttService.isConnected());
        status.put("clientId", mqttService.getClientId());
        status.put("serverUri", mqttService.getServerUri());
        return status;
    }
}
