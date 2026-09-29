package com.code3d.service;

import com.code3d.entity.UserRecord;
import com.code3d.model.AuthRequest;
import com.code3d.model.AuthResponse;
import com.code3d.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initDefaultUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(new UserRecord(
                    "himanshu",
                    "himanshu@code3d.edu",
                    passwordEncoder.encode("admin123"),
                    "Himanshu (Lead Architect)",
                    "Lead Architect",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            ));

            userRepository.save(new UserRecord(
                    "student.alex",
                    "alex@college.edu",
                    passwordEncoder.encode("student123"),
                    "Alex Rivera",
                    "Student Developer",
                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
            ));
        }
    }

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsername();
        if (identifier == null || identifier.isBlank()) {
            identifier = request.getEmail();
        }
        if (identifier == null || identifier.isBlank()) {
            identifier = request.getUsernameOrEmail();
        }

        if (identifier != null) {
            identifier = identifier.trim();
        }

        if (identifier == null || identifier.isBlank()) {
            return AuthResponse.error("Username or email is required");
        }

        String rawPassword = request.getPassword();
        if (rawPassword != null) {
            rawPassword = rawPassword.trim();
        }

        if (rawPassword == null || rawPassword.isBlank()) {
            return AuthResponse.error("Password is required");
        }

        Optional<UserRecord> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        if (userOpt.isEmpty()) {
            return AuthResponse.error("Invalid credentials provided");
        }

        UserRecord user = userOpt.get();
        boolean matches = passwordEncoder.matches(rawPassword, user.getPassword());
        if (!matches && rawPassword.equals(user.getPassword())) {
            matches = true;
            // Upgrade legacy plain password to BCrypt hash
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        }

        if (!matches) {
            return AuthResponse.error("Invalid credentials provided");
        }

        return AuthResponse.success(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole(), user.getAvatarUrl());
    }

    public AuthResponse register(AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return AuthResponse.error("Username is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return AuthResponse.error("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return AuthResponse.error("Password must be at least 6 characters long");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return AuthResponse.error("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("Email is already registered");
        }

        String role = request.getRole() != null && !request.getRole().isBlank() ? request.getRole() : "Student Developer";
        String fullName = request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : request.getUsername();
        String avatar = request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()
                ? request.getAvatarUrl()
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

        UserRecord user = new UserRecord(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                fullName,
                role,
                avatar
        );

        UserRecord saved = userRepository.save(user);
        return AuthResponse.success(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getRole(), saved.getAvatarUrl());
    }

    public Optional<UserRecord> getCurrentUser(String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return userRepository.findAll().stream().findFirst();
        }
        Optional<UserRecord> opt = userRepository.findByUsername(usernameOrEmail);
        if (opt.isPresent()) return opt;
        return userRepository.findByEmail(usernameOrEmail);
    }
}
