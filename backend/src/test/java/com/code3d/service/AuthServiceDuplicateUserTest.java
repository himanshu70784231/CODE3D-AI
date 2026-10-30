package com.code3d.service;

import com.code3d.entity.UserRecord;
import com.code3d.model.AuthRequest;
import com.code3d.model.AuthResponse;
import com.code3d.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceDuplicateUserTest {

    @Mock
    private UserRepository userRepository;

    private AuthService authService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UserRecord user1;
    private UserRecord user3;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository);

        // Simulate the exact Neon database state: two users sharing the same email
        user1 = new UserRecord(
                "himanshu",
                "himanshu70784231@gmail.com",
                passwordEncoder.encode("secretPassword123"),
                "Himanshu (Lead Architect)",
                "Lead Architect",
                "https://example.com/avatar1.jpg"
        );
        user1.setId(1L);

        user3 = new UserRecord(
                "himanshu chauhan",
                "himanshu70784231@gmail.com",
                passwordEncoder.encode("alternatePass456"),
                "Himanshu Chauhan",
                "Full-Stack Engineer",
                "https://example.com/avatar3.jpg"
        );
        user3.setId(3L);
    }

    @Test
    @DisplayName("Login succeeds when 2 database records share the same email and user provides password for User 1")
    void testLoginWithDuplicateEmailReturnsUser1() {
        String sharedEmail = "himanshu70784231@gmail.com";
        List<UserRecord> duplicates = Arrays.asList(user1, user3);

        when(userRepository.findByIdentifierIgnoreCase(sharedEmail)).thenReturn(duplicates);

        AuthRequest request = new AuthRequest();
        request.setUsernameOrEmail(sharedEmail);
        request.setPassword("secretPassword123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess(), "Login should succeed without throwing NonUniqueResultException");
        assertEquals(1L, response.getUserId());
        assertEquals("himanshu", response.getUsername());
        assertEquals(sharedEmail, response.getEmail());
    }

    @Test
    @DisplayName("Login succeeds when 2 database records share the same email and user provides password for User 3")
    void testLoginWithDuplicateEmailReturnsUser3() {
        String sharedEmail = "himanshu70784231@gmail.com";
        List<UserRecord> duplicates = Arrays.asList(user1, user3);

        when(userRepository.findByIdentifierIgnoreCase(sharedEmail)).thenReturn(duplicates);

        AuthRequest request = new AuthRequest();
        request.setUsernameOrEmail(sharedEmail);
        request.setPassword("alternatePass456");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess(), "Login should match the second user record without throwing NonUniqueResultException");
        assertEquals(3L, response.getUserId());
        assertEquals("himanshu chauhan", response.getUsername());
        assertEquals(sharedEmail, response.getEmail());
    }

    @Test
    @DisplayName("Login returns controlled 401 error message when duplicate records exist but password is wrong")
    void testLoginWithDuplicateEmailWrongPasswordReturnsControlledError() {
        String sharedEmail = "himanshu70784231@gmail.com";
        List<UserRecord> duplicates = Arrays.asList(user1, user3);

        when(userRepository.findByIdentifierIgnoreCase(sharedEmail)).thenReturn(duplicates);

        AuthRequest request = new AuthRequest();
        request.setUsernameOrEmail(sharedEmail);
        request.setPassword("completelyWrongPassword");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertFalse(response.isSuccess(), "Login should return false for invalid credentials");
        assertEquals("Invalid credentials provided", response.getMessage());
    }

    @Test
    @DisplayName("Registration rejects duplicate email case-insensitively with controlled error")
    void testRegistrationRejectsDuplicateEmail() {
        when(userRepository.existsByTrimmedUsernameIgnoreCase("newuser")).thenReturn(false);
        when(userRepository.existsByTrimmedEmailIgnoreCase("himanshu70784231@gmail.com")).thenReturn(true);

        AuthRequest request = new AuthRequest();
        request.setUsername("newuser");
        request.setEmail("  HIMANSHU70784231@GMAIL.COM  ");
        request.setPassword("strongPassword123");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("Email is already registered", response.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registration rejects duplicate username case-insensitively with controlled error")
    void testRegistrationRejectsDuplicateUsername() {
        when(userRepository.existsByTrimmedUsernameIgnoreCase("HIMANSHU")).thenReturn(true);

        AuthRequest request = new AuthRequest();
        request.setUsername("  HIMANSHU  ");
        request.setEmail("brandnew@example.com");
        request.setPassword("strongPassword123");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertEquals("Username is already taken", response.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("getCurrentUser handles duplicate email query without throwing NonUniqueResultException")
    void testGetCurrentUserWithDuplicateEmail() {
        String sharedEmail = "himanshu70784231@gmail.com";
        when(userRepository.findByIdentifierIgnoreCase(sharedEmail)).thenReturn(Arrays.asList(user1, user3));

        Optional<UserRecord> result = authService.getCurrentUser(sharedEmail);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
    }
}
