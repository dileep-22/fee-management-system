package com.feemanagement.service.impl;

import com.feemanagement.dto.AuthDTO;
import com.feemanagement.entity.User;
import com.feemanagement.exception.BusinessException;
import com.feemanagement.exception.DuplicateResourceException;
import com.feemanagement.exception.ResourceNotFoundException;
import com.feemanagement.repository.UserRepository;
import com.feemanagement.security.JwtUtil;
import com.feemanagement.service.IAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken  = jwtUtil.generateToken(userDetails, user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        log.info("User '{}' logged in with role {}", user.getUsername(), user.getRole());
        return buildAuthResponse(accessToken, refreshToken, user);
    }

    /**
     * Public self-registration — always creates STAFF accounts.
     */
    @Override
    public AuthDTO.AuthResponse signup(AuthDTO.SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        if (userRepository.existsByEmail(request.getEmail()))
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.STAFF)   // public signup always STAFF
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New account registered via public signup: {} (STAFF)", user.getUsername());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken  = jwtUtil.generateToken(userDetails, user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    /**
     * Admin-only registration — can assign any role.
     */
    @Override
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        if (userRepository.existsByEmail(request.getEmail()))
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());

        User.Role role = request.getRole() != null ? request.getRole() : User.Role.STAFF;

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered by admin: {} ({})", user.getUsername(), user.getRole());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken  = jwtUtil.generateToken(userDetails, user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Override
    public AuthDTO.AuthResponse refreshToken(AuthDTO.RefreshTokenRequest request) {
        try {
            String username = jwtUtil.extractUsername(request.getRefreshToken());
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtUtil.isTokenValid(request.getRefreshToken(), userDetails))
                throw new BusinessException("Invalid or expired refresh token");

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String newAccessToken  = jwtUtil.generateToken(userDetails, user.getRole().name());
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
            return buildAuthResponse(newAccessToken, newRefreshToken, user);
        } catch (BusinessException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Invalid or expired refresh token");
        }
    }

    @Override
    public void changePassword(String username, AuthDTO.ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new BusinessException("Current password is incorrect");

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user '{}'", username);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDTO.UserInfo getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthDTO.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    private AuthDTO.AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(AuthDTO.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
