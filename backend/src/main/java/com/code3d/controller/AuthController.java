package com.code3d.controller;

import com.code3d.entity.UserRecord;
import com.code3d.model.AuthRequest;
import com.code3d.model.AuthResponse;
import com.code3d.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/register", "/signup"})
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        if (!response.isSuccess()) {
            if (response.getMessage() != null && (response.getMessage().contains("already taken") || response.getMessage().contains("already registered"))) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Logged out successfully");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                     @RequestParam(value = "username", required = false) String username) {
        String lookup = username;
        if (lookup == null && authHeader != null && authHeader.contains("code3d_jwt_")) {
            String[] parts = authHeader.replace("Bearer ", "").split("_");
            if (parts.length >= 3) {
                lookup = parts[2];
            }
        }

        Optional<UserRecord> userOpt = authService.getCurrentUser(lookup);
        Map<String, Object> res = new HashMap<>();
        if (userOpt.isPresent()) {
            UserRecord u = userOpt.get();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", u.getId());
            userData.put("username", u.getUsername());
            userData.put("email", u.getEmail());
            userData.put("fullName", u.getFullName());
            userData.put("role", u.getRole());
            userData.put("avatarUrl", u.getAvatarUrl());

            res.put("success", true);
            res.put("user", userData);
            res.put("data", userData);
            return ResponseEntity.ok(res);
        } else {
            res.put("success", false);
            res.put("message", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
    }
}
