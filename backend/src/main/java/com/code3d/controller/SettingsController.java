package com.code3d.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final Map<String, Object> globalSettings = new ConcurrentHashMap<>();

    public SettingsController() {
        globalSettings.put("theme", "dark");
        globalSettings.put("editorFontSize", 14);
        globalSettings.put("animationSpeed", 1.0);
        globalSettings.put("autoplay", true);
        globalSettings.put("preferredLanguage", "java");
        globalSettings.put("showStatePanel", true);
        globalSettings.put("showCpuHologram", true);
        globalSettings.put("showVariableHologram", true);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new HashMap<>(globalSettings));
        response.put("settings", new HashMap<>(globalSettings));
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> payload) {
        if (payload != null) {
            globalSettings.putAll(payload);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new HashMap<>(globalSettings));
        response.put("settings", new HashMap<>(globalSettings));
        return ResponseEntity.ok(response);
    }
}
