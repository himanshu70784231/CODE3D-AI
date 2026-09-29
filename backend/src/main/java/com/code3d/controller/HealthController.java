package com.code3d.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "CODE3D-AI Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> dbHealth = new HashMap<>();
        boolean dbHealthy = false;

        try (Connection conn = dataSource.getConnection()) {
            if (conn != null && conn.isValid(3)) {
                dbHealthy = true;
                dbHealth.put("status", "UP");
                dbHealth.put("database", conn.getCatalog());
                dbHealth.put("product", conn.getMetaData().getDatabaseProductName());
                dbHealth.put("version", conn.getMetaData().getDatabaseProductVersion());
            } else {
                dbHealth.put("status", "DOWN");
                dbHealth.put("error", "Connection validation timed out");
            }
        } catch (Exception e) {
            dbHealthy = false;
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
        }

        response.put("database", dbHealth);

        if (dbHealthy) {
            response.put("status", "UP");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "DEGRADED");
            response.put("message", "History service is temporarily unavailable, running in local resilience mode.");
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }
}
