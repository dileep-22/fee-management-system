package com.feemanagement.controller;

import com.feemanagement.dto.ApiResponse;
import com.feemanagement.dto.AuthDTO;
import com.feemanagement.service.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    /** Public login */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    /**
     * Public self-registration — anyone can sign up.
     * New accounts default to STAFF role; ADMIN role requires /register (admin-only).
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> signup(
            @Valid @RequestBody AuthDTO.SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", authService.signup(request)));
    }

    /**
     * Admin-only: create accounts with any role (including ADMIN).
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authService.register(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> refresh(
            @Valid @RequestBody AuthDTO.RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody AuthDTO.ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDTO.UserInfo>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(authService.getMe(authentication.getName())));
    }
}
