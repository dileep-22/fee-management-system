package com.feemanagement.config;

import com.feemanagement.entity.User;
import com.feemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a single ADMIN user on first startup only if no admin exists.
 * All other accounts are created via /api/v1/auth/signup (public)
 * or /api/v1/auth/register (admin-only for elevated roles).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@feemanage.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("========================================================");
            log.info("  First-run: admin account created");
            log.info("  Username : admin");
            log.info("  Password : admin123");
            log.info("  → Please change the password after first login!");
            log.info("  All other users should sign up via /signup");
            log.info("========================================================");
        }
    }
}
