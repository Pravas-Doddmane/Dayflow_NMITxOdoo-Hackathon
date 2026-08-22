package com.techtitans.dayflow.auth.controller;

import com.techtitans.dayflow.auth.dto.*;
import com.techtitans.dayflow.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Public authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-admin")
    @Operation(summary = "Register a new company and admin account",
               description = "Registers the company, creates the admin user, and sends an email verification link")
    public ResponseEntity<Map<String, String>> registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        authService.registerAdmin(request);
        return ResponseEntity.ok(Map.of(
                "message", "Company and Admin registered successfully. Please check your email to verify your account before logging in."
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password (and optional company name)", description = "Returns a JWT token on success")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/setup-password")
    @Operation(summary = "Setup password using invitation token",
               description = "Used by employees to set their password using the emailed invitation link")
    public ResponseEntity<Map<String, String>> setupPassword(@Valid @RequestBody SetupPasswordRequest request) {
        authService.setupPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password set successfully. You can now log in."));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email address using token")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset link",
               description = "Always returns success to prevent email enumeration")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message",
                "If an account exists for this email, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from email")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }
}
