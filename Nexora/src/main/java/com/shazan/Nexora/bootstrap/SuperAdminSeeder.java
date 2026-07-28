package com.shazan.Nexora.bootstrap;

import com.shazan.Nexora.domain.admin.SuperAdmin;
import com.shazan.Nexora.domain.enums.Role;
import com.shazan.Nexora.repository.admin.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SuperAdminSeeder {

    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.seed-email}")
    private String seedEmail;

    @Value("${app.super-admin.seed-password}")
    private String seedPassword;

    @Bean
    public ApplicationRunner seedSuperAdmin() {
        return args -> {
            if (superAdminRepository.existsByEmail(seedEmail)) {
                log.info("Super Admin already present: {}", seedEmail);
                return;
            }
            SuperAdmin sa = SuperAdmin.builder()
                    .name("Nexora Super Admin")
                    .email(seedEmail)
                    .passwordHash(passwordEncoder.encode(seedPassword))
                    .role(Role.ROLE_SUPER_ADMIN)
                    .build();
            superAdminRepository.save(sa);
            log.info("Seeded Super Admin: {}", seedEmail);
        };
    }
}
