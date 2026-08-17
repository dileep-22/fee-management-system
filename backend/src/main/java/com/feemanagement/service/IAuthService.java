package com.feemanagement.service;

import com.feemanagement.dto.AuthDTO;

public interface IAuthService {
    AuthDTO.AuthResponse login(AuthDTO.LoginRequest request);
    AuthDTO.AuthResponse signup(AuthDTO.SignupRequest request);          // public
    AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request);     // admin-only
    AuthDTO.AuthResponse refreshToken(AuthDTO.RefreshTokenRequest request);
    void changePassword(String username, AuthDTO.ChangePasswordRequest request);
    AuthDTO.UserInfo getMe(String username);
}
