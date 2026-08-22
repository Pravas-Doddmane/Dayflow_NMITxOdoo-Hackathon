package com.techtitans.dayflow.config;

import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.user.entity.Role;
import com.techtitans.dayflow.user.entity.User;
import com.techtitans.dayflow.user.repository.RoleRepository;
import com.techtitans.dayflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds the initial ADMIN user on startup.
 * Runs after Flyway migrations (roles are already seeded by V9).
 * Idempotent: will not create a duplicate if admin already exists.
 *
 * Credentials are read from environment variables:
 *   ADMIN_EMAIL
 *   ADMIN_PASSWORD
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final com.techtitans.dayflow.company.repository.CompanyRepository companyRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> {
                    log.info("ADMIN role not found. Seeding default ADMIN role.");
                    return roleRepository.save(Role.builder()
                            .name(RoleName.ADMIN)
                            .description("System administrator with full access")
                            .build());
                });

        roleRepository.findByName(RoleName.EMPLOYEE)
                .orElseGet(() -> {
                    log.info("EMPLOYEE role not found. Seeding default EMPLOYEE role.");
                    return roleRepository.save(Role.builder()
                            .name(RoleName.EMPLOYEE)
                            .description("Regular employee with limited access")
                            .build());
                });

        com.techtitans.dayflow.company.entity.Company defaultCompany = companyRepository.findByNameIgnoreCase("TechTitans")
                .orElseGet(() -> companyRepository.save(com.techtitans.dayflow.company.entity.Company.builder()
                        .name("TechTitans")
                        .code("TECHTITANS")
                        .build()));

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists: {}. Skipping seed.", adminEmail);
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(adminRole)
                .company(defaultCompany)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();

        userRepository.save(admin);
        log.info("✅ Initial ADMIN user seeded: {} (Company: TechTitans)", adminEmail);
        log.info("⚠️  Change the admin password immediately after first login!");
    }
}
