package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;

@RestController
public class HealthController {

    private final HealthIndicator customHealthIndicator;

    public HealthController(HealthIndicator customHealthIndicator) {
        this.customHealthIndicator = customHealthIndicator;
    }

    @GetMapping("/health")
    public ResponseEntity<Health> healthCheck() {
        Health health = customHealthIndicator.health();
        return ResponseEntity.ok(health);
    }
}
