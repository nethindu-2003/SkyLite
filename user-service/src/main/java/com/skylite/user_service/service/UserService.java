package com.skylite.user_service.service;

import com.skylite.user_service.dto.AuthResponse;
import com.skylite.user_service.dto.LoginRequest;
import com.skylite.user_service.dto.RegisterRequest;
import com.skylite.user_service.entity.Admin;
import com.skylite.user_service.entity.User;
import com.skylite.user_service.repository.AdminRepository;
import com.skylite.user_service.repository.UserRepository;
import com.skylite.user_service.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository; // Inject Admin repo
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        // Setup Verification
        user.setStatus("pending");
        String token = java.util.UUID.randomUUID().toString();
        user.setVerificationToken(token);

        userRepository.save(user);

        // Send HTML Email
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);

        // Do NOT generate JWT here. They must verify first.
        return new AuthResponse(null, "Registration successful. Please verify email.", user.getUserId(), user.getName(), "USER");
    }

    // Add Verification Method
    public void verifyUser(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token."));

        user.setStatus("active");
        user.setVerificationToken(null); // Clear token after use
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        // Handle ADMIN login
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            Admin admin = adminRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid admin credentials."));

            if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                throw new RuntimeException("Invalid admin credentials.");
            }

            String token = jwtService.generateToken(admin.getEmail(), admin.getAdminId(), "ADMIN");
            return new AuthResponse(token, "Admin login successful", admin.getAdminId(), admin.getName(), "ADMIN");
        }

        // Handle standard USER login
        else {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid user credentials."));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid user credentials.");
            }

            if ("blocked".equalsIgnoreCase(user.getStatus())) {
                throw new RuntimeException("Your account has been suspended.");
            }

            String token = jwtService.generateToken(user.getEmail(), user.getUserId(), "USER");
            return new AuthResponse(token, "User login successful", user.getUserId(), user.getName(), "USER");
        }
    }
    public void resetPassword(String token, String newPassword) {
        // 1. Find user by the token
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));

        // 2. Check if token has expired
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset link has expired. Please request a new one.");
        }

        // 3. Hash the new password and save (passwordEncoder already configured with Bcrypt salt)
        user.setPassword(passwordEncoder.encode(newPassword));

        // 4. Clear the tokens so they can't be reused
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }
}