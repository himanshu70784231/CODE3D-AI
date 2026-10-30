package com.code3d.service;

import com.code3d.entity.UserRecord;
import com.code3d.model.AuthRequest;
import com.code3d.model.AuthResponse;
import com.code3d.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
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

        try {
            // Safe candidate lookup: returns a List to prevent NonUniqueResultException if duplicate records exist
            List<UserRecord> candidates = userRepository.findByIdentifierIgnoreCase(identifier);
            if (candidates == null || candidates.isEmpty()) {
                candidates = userRepository.findAllByEmailIgnoreCase(identifier);
            }
            if (candidates == null || candidates.isEmpty()) {
                candidates = userRepository.findAllByUsernameIgnoreCase(identifier);
            }

            if (candidates == null || candidates.isEmpty()) {
                return AuthResponse.error("Invalid credentials provided");
            }

            UserRecord authenticatedUser = null;
            for (UserRecord user : candidates) {
                if (user == null || user.getPassword() == null) continue;

                boolean matches = passwordEncoder.matches(rawPassword, user.getPassword());
                if (!matches && rawPassword.equals(user.getPassword())) {
                    matches = true;
                    // Upgrade legacy plain password to BCrypt hash
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    userRepository.save(user);
                }

                if (matches) {
                    authenticatedUser = user;
                    break;
                }
            }

            if (authenticatedUser == null) {
                return AuthResponse.error("Invalid credentials provided");
            }

            return AuthResponse.success(
                    authenticatedUser.getId(),
                    authenticatedUser.getUsername(),
                    authenticatedUser.getEmail(),
                    authenticatedUser.getFullName(),
                    authenticatedUser.getRole(),
                    authenticatedUser.getAvatarUrl()
            );
        } catch (Exception ex) {
            return AuthResponse.error("Authentication failed. Please verify your credentials.");
        }
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

        String cleanUsername = request.getUsername().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword().trim();

        if (cleanUsername.isEmpty()) {
            return AuthResponse.error("Username cannot be empty");
        }
        if (!cleanEmail.contains("@") || cleanEmail.startsWith("@") || cleanEmail.endsWith("@")) {
            return AuthResponse.error("Please provide a valid email address");
        }

        if (userRepository.existsByTrimmedUsernameIgnoreCase(cleanUsername)) {
            return AuthResponse.error("Username is already taken");
        }
        if (userRepository.existsByTrimmedEmailIgnoreCase(cleanEmail)) {
            return AuthResponse.error("Email is already registered");
        }

        String role = request.getRole() != null && !request.getRole().isBlank() ? request.getRole().trim() : "Student Developer";
        String fullName = request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName().trim() : cleanUsername;
        String avatar = request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()
                ? request.getAvatarUrl().trim()
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

        UserRecord user = new UserRecord(
                cleanUsername,
                cleanEmail,
                passwordEncoder.encode(rawPassword),
                fullName,
                role,
                avatar
        );

        try {
            UserRecord saved = userRepository.save(user);
            return AuthResponse.success(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getRole(), saved.getAvatarUrl());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return AuthResponse.error("An account with this username or email already exists");
        } catch (Exception ex) {
            return AuthResponse.error("Registration could not be completed. Please try again.");
        }
    }

    public Optional<UserRecord> getCurrentUser(String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return userRepository.findAll().stream().findFirst();
        }
        String clean = usernameOrEmail.trim();
        List<UserRecord> users = userRepository.findByIdentifierIgnoreCase(clean);
        if (users != null && !users.isEmpty()) {
            return Optional.of(users.get(0));
        }
        return Optional.empty();
    }
}
