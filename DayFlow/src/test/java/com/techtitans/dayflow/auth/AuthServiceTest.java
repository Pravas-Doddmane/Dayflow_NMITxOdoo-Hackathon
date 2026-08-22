package com.techtitans.dayflow.auth;

import com.techtitans.dayflow.auth.dto.*;
import com.techtitans.dayflow.auth.entity.AuthToken;
import com.techtitans.dayflow.auth.service.AuthService;
import com.techtitans.dayflow.auth.service.TokenService;
import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.enums.TokenType;
import com.techtitans.dayflow.common.exception.AccountDisabledException;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.InvalidTokenException;
import com.techtitans.dayflow.common.exception.TokenExpiredException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private TokenService tokenService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;

    @InjectMocks
    private AuthService authService;

    private User activeUser;
    private Role employeeRole;
    private Company testCompany;

    @BeforeEach
    void setUp() {
        testCompany = Company.builder().id(1L).name("Acme Corp").code("ACME").build();
        employeeRole = Role.builder().id(2L).name(RoleName.EMPLOYEE).build();
        activeUser = User.builder()
                .id(1L)
                .email("employee@test.com")
                .passwordHash("hashed-password")
                .role(employeeRole)
                .company(testCompany)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
    }

    // ==========================================
    // Register Admin Tests
    // ==========================================

    @Nested
    @DisplayName("Admin Registration")
    class RegisterAdminTests {

        @Test
        @DisplayName("Successfully registers new admin and company")
        void registerAdmin_success() {
            when(userRepository.existsByEmail("admin@acme.com")).thenReturn(false);
            when(companyRepository.existsByNameIgnoreCase("Acme Corp")).thenReturn(false);
            when(companyRepository.existsByCodeIgnoreCase(anyString())).thenReturn(false);
            when(companyRepository.save(any())).thenReturn(testCompany);
            when(roleRepository.findByName(RoleName.ADMIN)).thenReturn(Optional.of(Role.builder().name(RoleName.ADMIN).build()));
            when(passwordEncoder.encode(anyString())).thenReturn("encoded-pass");
            when(tokenService.createToken(any(), eq(TokenType.EMAIL_VERIFICATION))).thenReturn("verify-token");
            when(emailTemplateService.buildAdminRegistrationVerificationEmail(anyString(), any(), anyString())).thenReturn("<html/>");

            authService.registerAdmin(new AdminRegisterRequest("Acme Corp", "admin@acme.com", "AdminPass@123", "Alice", "Smith", null, null));

            verify(userRepository).save(any(User.class));
            verify(emailService).sendHtmlEmail(eq("admin@acme.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("Duplicate company name throws DuplicateResourceException")
        void registerAdmin_duplicateCompany() {
            when(companyRepository.existsByNameIgnoreCase("Acme Corp")).thenReturn(true);

            assertThatThrownBy(() -> authService.registerAdmin(
                    new AdminRegisterRequest("Acme Corp", "admin@acme.com", "AdminPass@123", "Alice", "Smith", null, null)))
                    .isInstanceOf(com.techtitans.dayflow.common.exception.DuplicateResourceException.class)
                    .hasMessageContaining("already registered");
        }
    }

    // ==========================================
    // Login Tests
    // ==========================================

    @Nested
    @DisplayName("Login")
    class LoginTests {

        @Test
        @DisplayName("Successful login returns JWT response")
        void login_success() {
            SecurityUser securityUser = new SecurityUser(activeUser);
            var authToken = new UsernamePasswordAuthenticationToken(securityUser, null, securityUser.getAuthorities());

            when(authenticationManager.authenticate(any())).thenReturn(authToken);
            when(employeeRepository.findByUserId(1L)).thenReturn(Optional.empty());
            when(jwtService.generateToken(anyLong(), anyString(), any(), any(), any())).thenReturn("jwt-token");
            when(jwtService.getExpirationMs()).thenReturn(86400000L);

            LoginResponse response = authService.login(new LoginRequest(null, "employee@test.com", "password"));

            assertThat(response.token()).isEqualTo("jwt-token");
            assertThat(response.role()).isEqualTo("EMPLOYEE");
            assertThat(response.email()).isEqualTo("employee@test.com");
            assertThat(response.companyName()).isEqualTo("Acme Corp");
        }

        @Test
        @DisplayName("Successful login with companyName returns JWT response")
        void login_withCompanyName_success() {
            when(companyRepository.findByNameIgnoreCase("Acme Corp")).thenReturn(Optional.of(testCompany));
            when(userRepository.findByEmailAndCompanyId("employee@test.com", 1L)).thenReturn(Optional.of(activeUser));
            when(passwordEncoder.matches("password", "hashed-password")).thenReturn(true);
            when(employeeRepository.findByUserId(1L)).thenReturn(Optional.empty());
            when(jwtService.generateToken(anyLong(), anyString(), any(), any(), any())).thenReturn("jwt-token");
            when(jwtService.getExpirationMs()).thenReturn(86400000L);

            LoginResponse response = authService.login(new LoginRequest("Acme Corp", "employee@test.com", "password"));

            assertThat(response.token()).isEqualTo("jwt-token");
            assertThat(response.role()).isEqualTo("EMPLOYEE");
            assertThat(response.companyName()).isEqualTo("Acme Corp");
        }

        @Test
        @DisplayName("Wrong password throws exception")
        void login_wrongPassword() {
            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThatThrownBy(() -> authService.login(new LoginRequest(null, "employee@test.com", "wrong")))
                    .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("Disabled account cannot login")
        void login_disabledAccount() {
            activeUser.setAccountStatus(AccountStatus.DISABLED);
            SecurityUser securityUser = new SecurityUser(activeUser);
            var authToken = new UsernamePasswordAuthenticationToken(securityUser, null, securityUser.getAuthorities());

            when(authenticationManager.authenticate(any())).thenReturn(authToken);

            assertThatThrownBy(() -> authService.login(new LoginRequest(null, "employee@test.com", "password")))
                    .isInstanceOf(AccountDisabledException.class)
                    .hasMessageContaining("disabled");
        }

        @Test
        @DisplayName("INVITED account cannot login (setup not complete)")
        void login_invitedAccount() {
            activeUser.setAccountStatus(AccountStatus.INVITED);
            SecurityUser securityUser = new SecurityUser(activeUser);
            var authToken = new UsernamePasswordAuthenticationToken(securityUser, null, securityUser.getAuthorities());

            when(authenticationManager.authenticate(any())).thenReturn(authToken);

            assertThatThrownBy(() -> authService.login(new LoginRequest(null, "employee@test.com", "password")))
                    .isInstanceOf(AccountDisabledException.class)
                    .hasMessageContaining("setup");
        }

        @Test
        @DisplayName("Unverified email cannot login")
        void login_unverifiedEmail() {
            activeUser.setEmailVerified(false);
            SecurityUser securityUser = new SecurityUser(activeUser);
            var authToken = new UsernamePasswordAuthenticationToken(securityUser, null, securityUser.getAuthorities());

            when(authenticationManager.authenticate(any())).thenReturn(authToken);

            assertThatThrownBy(() -> authService.login(new LoginRequest(null, "employee@test.com", "password")))
                    .isInstanceOf(AccountDisabledException.class)
                    .hasMessageContaining("verify your email");
        }
    }

    // ==========================================
    // Setup Password Tests
    // ==========================================

    @Nested
    @DisplayName("Setup Password")
    class SetupPasswordTests {

        @Test
        @DisplayName("Valid token activates account")
        void setupPassword_success() {
            AuthToken token = AuthToken.builder()
                    .id(1L)
                    .tokenHash("hash")
                    .user(activeUser)
                    .tokenType(TokenType.PASSWORD_SETUP)
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .build();
            activeUser.setAccountStatus(AccountStatus.INVITED);

            when(tokenService.validateToken("raw-token", TokenType.PASSWORD_SETUP)).thenReturn(token);
            when(passwordEncoder.encode("NewPass@123")).thenReturn("new-hashed");
            when(userRepository.save(any())).thenReturn(activeUser);

            authService.setupPassword(new SetupPasswordRequest("raw-token", "NewPass@123", "NewPass@123"));

            assertThat(activeUser.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
            verify(tokenService).consumeToken(token);
        }

        @Test
        @DisplayName("Passwords do not match throws exception")
        void setupPassword_mismatch() {
            assertThatThrownBy(() -> authService.setupPassword(
                    new SetupPasswordRequest("token", "Pass@123", "Different@123")))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Passwords do not match");
        }

        @Test
        @DisplayName("Expired token throws TokenExpiredException")
        void setupPassword_expiredToken() {
            when(tokenService.validateToken("expired-token", TokenType.PASSWORD_SETUP))
                    .thenThrow(new TokenExpiredException("Token has expired"));

            assertThatThrownBy(() -> authService.setupPassword(
                    new SetupPasswordRequest("expired-token", "Pass@123", "Pass@123")))
                    .isInstanceOf(TokenExpiredException.class);
        }

        @Test
        @DisplayName("Used token throws InvalidTokenException")
        void setupPassword_usedToken() {
            when(tokenService.validateToken("used-token", TokenType.PASSWORD_SETUP))
                    .thenThrow(new InvalidTokenException("Token has already been used"));

            assertThatThrownBy(() -> authService.setupPassword(
                    new SetupPasswordRequest("used-token", "Pass@123", "Pass@123")))
                    .isInstanceOf(InvalidTokenException.class);
        }
    }

    // ==========================================
    // Forgot Password Tests
    // ==========================================

    @Nested
    @DisplayName("Forgot Password")
    class ForgotPasswordTests {

        @Test
        @DisplayName("Returns generic message even for unknown email")
        void forgotPassword_unknownEmail() {
            when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
            assertThatCode(() -> authService.forgotPassword(new ForgotPasswordRequest("unknown@test.com")))
                    .doesNotThrowAnyException();
            verify(tokenService, never()).createToken(any(), any());
        }

        @Test
        @DisplayName("Active user gets reset token")
        void forgotPassword_activeUser() {
            when(userRepository.findByEmail("employee@test.com")).thenReturn(Optional.of(activeUser));
            when(employeeRepository.findByUserId(1L)).thenReturn(Optional.empty());
            when(tokenService.createToken(activeUser, TokenType.PASSWORD_RESET)).thenReturn("reset-token");
            when(emailTemplateService.buildPasswordResetEmail(anyString(), anyString())).thenReturn("<html/>");

            authService.forgotPassword(new ForgotPasswordRequest("employee@test.com"));

            verify(tokenService).createToken(activeUser, TokenType.PASSWORD_RESET);
            verify(emailService).sendHtmlEmail(eq("employee@test.com"), anyString(), anyString());
        }
    }

    // ==========================================
    // Reset Password Tests
    // ==========================================

    @Nested
    @DisplayName("Reset Password")
    class ResetPasswordTests {

        @Test
        @DisplayName("Valid reset token updates password")
        void resetPassword_success() {
            AuthToken token = AuthToken.builder()
                    .id(1L)
                    .tokenHash("hash")
                    .user(activeUser)
                    .tokenType(TokenType.PASSWORD_RESET)
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .build();

            when(tokenService.validateToken("valid-token", TokenType.PASSWORD_RESET)).thenReturn(token);
            when(passwordEncoder.encode("NewPass@123")).thenReturn("new-hash");
            when(userRepository.save(any())).thenReturn(activeUser);

            authService.resetPassword(new ResetPasswordRequest("valid-token", "NewPass@123", "NewPass@123"));

            assertThat(activeUser.getPasswordHash()).isEqualTo("new-hash");
            verify(tokenService).consumeToken(token);
        }
    }
}
