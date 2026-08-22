package com.techtitans.dayflow.auth.service;

import com.techtitans.dayflow.auth.dto.*;
import com.techtitans.dayflow.auth.entity.AuthToken;
import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.enums.TokenType;
import com.techtitans.dayflow.common.exception.AccountDisabledException;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.DuplicateResourceException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.company.entity.Company;
import com.techtitans.dayflow.company.repository.CompanyRepository;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.notification.EmailService;
import com.techtitans.dayflow.notification.EmailTemplateService;
import com.techtitans.dayflow.security.JwtService;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.Role;
import com.techtitans.dayflow.user.entity.User;
import com.techtitans.dayflow.user.repository.RoleRepository;
import com.techtitans.dayflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    // ==========================================
    // Register Admin & Company
    // ==========================================

    @Transactional
    public void registerAdmin(AdminRegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String companyName = request.companyName().trim();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists");
        }

        if (companyRepository.existsByNameIgnoreCase(companyName)) {
            throw new DuplicateResourceException("A company with the name '" + companyName + "' is already registered");
        }

        String baseCode = companyName.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (baseCode.length() < 3) baseCode = "CMP";
        if (baseCode.length() > 10) baseCode = baseCode.substring(0, 10);
        String code = baseCode;
        int suffix = 1;
        while (companyRepository.existsByCodeIgnoreCase(code)) {
            code = baseCode + suffix++;
        }

        Company company = companyRepository.save(Company.builder()
                .name(companyName)
                .code(code)
                .build());

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ADMIN)
                        .description("System administrator with full access")
                        .build()));

        User admin = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(adminRole)
                .company(company)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(false)
                .build();

        userRepository.save(admin);

        // Generate email verification token
        String rawToken = tokenService.createToken(admin, TokenType.EMAIL_VERIFICATION);

        // Send verification email
        String emailBody = emailTemplateService.buildAdminRegistrationVerificationEmail(
                company.getName(), request.firstName(), rawToken);
        emailService.sendHtmlEmail(admin.getEmail(), "Verify Your DayFlow Admin Account", emailBody);

        log.info("Admin registered for company {} (email: {}). Verification email sent.", company.getName(), email);
    }

    // ==========================================
    // Login
    // ==========================================

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user;

        if (StringUtils.hasText(request.companyName())) {
            String companyName = request.companyName().trim();
            Company company = companyRepository.findByNameIgnoreCase(companyName)
                    .orElseThrow(() -> new BadRequestException("Company not found with name: " + companyName));

            user = userRepository.findByEmailAndCompanyId(request.email().trim().toLowerCase(), company.getId())
                    .orElseThrow(() -> new BadRequestException("Invalid email, password, or company"));

            if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                throw new BadRequestException("Invalid email, password, or company");
            }
        } else {
            // Standard email authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );
            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            user = securityUser.getUser();
        }

        // Check account status
        if (user.getAccountStatus() == AccountStatus.DISABLED) {
            throw new AccountDisabledException("Your account has been disabled. Please contact HR.");
        }
        if (user.getAccountStatus() == AccountStatus.INVITED) {
            throw new AccountDisabledException("Your account setup is not complete. Please check your invitation email.");
        }
        if (!user.isEmailVerified()) {
            throw new AccountDisabledException("Please verify your email address before logging in. Check your inbox for the verification link.");
        }

        // Find employee ID if user has an employee record
        Long employeeId = employeeRepository.findByUserId(user.getId())
                .map(e -> e.getId())
                .orElse(null);

        Long companyId = user.getCompany() != null ? user.getCompany().getId() : null;
        String companyName = user.getCompany() != null ? user.getCompany().getName() : null;

        String role = user.getRole().getName().name();
        String token = jwtService.generateToken(user.getId(), role, employeeId, companyId, companyName);

        log.info("User {} logged in successfully with role {} (Company: {})", user.getEmail(), role, companyName);

        return LoginResponse.of(token, jwtService.getExpirationMs() / 1000,
                user.getId(), employeeId, role, user.getEmail(), companyId, companyName);
    }

    // ==========================================
    // Setup Password (Employee Invitation Flow)
    // ==========================================

    @Transactional
    public void setupPassword(SetupPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        AuthToken authToken = tokenService.validateToken(request.token(), TokenType.PASSWORD_SETUP);
        User user = authToken.getUser();

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(true); // Invitation link acts as email verification
        userRepository.save(user);

        tokenService.consumeToken(authToken);

        log.info("Password set up for user ID: {}. Account activated.", user.getId());
    }

    // ==========================================
    // Verify Email
    // ==========================================

    @Transactional
    public void verifyEmail(String rawToken) {
        AuthToken authToken = tokenService.validateToken(rawToken, TokenType.EMAIL_VERIFICATION);
        User user = authToken.getUser();

        user.setEmailVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        tokenService.consumeToken(authToken);

        log.info("Email verified for user ID: {}", user.getId());
    }

    // ==========================================
    // Forgot Password
    // ==========================================

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email().trim().toLowerCase()).ifPresent(user -> {
            if (user.getAccountStatus() == AccountStatus.ACTIVE) {
                String rawToken = tokenService.createToken(user, TokenType.PASSWORD_RESET);

                String firstName = employeeRepository.findByUserId(user.getId())
                        .map(e -> e.getFirstName())
                        .orElse("User");

                String emailBody = emailTemplateService.buildPasswordResetEmail(firstName, rawToken);
                emailService.sendHtmlEmail(user.getEmail(),
                        "DayFlow HRMS — Password Reset Request", emailBody);

                log.info("Password reset token generated for user ID: {}", user.getId());
            }
        });
    }

    // ==========================================
    // Reset Password
    // ==========================================

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        AuthToken authToken = tokenService.validateToken(request.token(), TokenType.PASSWORD_RESET);
        User user = authToken.getUser();

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        tokenService.consumeToken(authToken);

        log.info("Password reset successfully for user ID: {}", user.getId());
    }
}
