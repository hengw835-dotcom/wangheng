package com.smartharvester;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartHarvesterApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartHarvesterApplication.class, args);
    }
}