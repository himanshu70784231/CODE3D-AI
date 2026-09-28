package com.code3d.controller;

import com.code3d.entity.UserRecord;
import com.code3d.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserRepository userRepository;

    public UserProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam(value = "username", required = false) String username) {
        Optional<UserRecord> userOpt = username != null ? userRepository.findByUsername(username) : userRepository.findAll().stream().findFirst();
        Map<String, Object> response = new HashMap<>();
        if (userOpt.isPresent()) {
            UserRecord u = userOpt.get();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", u.getId());
            userData.put("username", u.getUsername());
            userData.put("email", u.getEmail());
            userData.put("fullName", u.getFullName());
            userData.put("role", u.getRole());
            userData.put("avatarUrl", u.getAvatarUrl());
            userData.put("createdAt", u.getCreatedAt());

            response.put("success", true);
            response.put("data", userData);
            response.put("profile", userData);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "User profile not found"));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Optional<UserRecord> userOpt = username != null ? userRepository.findByUsername(username) : userRepository.findAll().stream().findFirst();
        Map<String, Object> response = new HashMap<>();
        if (userOpt.isPresent()) {
            UserRecord u = userOpt.get();
            if (payload.containsKey("fullName")) u.setFullName((String) payload.get("fullName"));
            if (payload.containsKey("role")) u.setRole((String) payload.get("role"));
            if (payload.containsKey("avatarUrl")) u.setAvatarUrl((String) payload.get("avatarUrl"));
            if (payload.containsKey("email")) u.setEmail((String) payload.get("email"));

            UserRecord saved = userRepository.save(u);
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", saved.getId());
            userData.put("username", saved.getUsername());
            userData.put("email", saved.getEmail());
            userData.put("fullName", saved.getFullName());
            userData.put("role", saved.getRole());
            userData.put("avatarUrl", saved.getAvatarUrl());

            response.put("success", true);
            response.put("data", userData);
            response.put("profile", userData);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", Map.of("code", "NOT_FOUND", "message", "User profile not found"));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
