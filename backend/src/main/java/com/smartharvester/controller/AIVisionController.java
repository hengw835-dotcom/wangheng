package com.smartharvester.controller;

import com.smartharvester.service.AIVisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/ai-vision")
public class AIVisionController {
    @Autowired
    private AIVisionService aiVisionService;

    @PostMapping("/detect")
    public List<AIVisionService.DetectionResult> detectObjects(@RequestParam("image") MultipartFile image) {
        return aiVisionService.detectObjects(image);
    }

    @GetMapping("/yield-distribution/{fieldId}")
    public double[][] getYieldDistribution(@PathVariable String fieldId) {
        return aiVisionService.calculateYieldDistribution(fieldId);
    }
}