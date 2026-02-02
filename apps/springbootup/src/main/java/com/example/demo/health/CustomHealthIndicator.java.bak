package com.example.demo.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // Perform your health check logic here
        boolean isHealthy = performHealthCheck();

        if (isHealthy) {
            return Health.up().withDetail("message", "Application is healthy").build();
        } else {
            return Health.down().withDetail("message", "Application is not healthy").build();
        }
    }

    private boolean performHealthCheck() {
        // Implement your health check logic here
        return true; // Return true if healthy, false otherwise
    }
}
