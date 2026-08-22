package com.techtitans.dayflow.employee;

import com.techtitans.dayflow.auth.service.TokenService;
import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.enums.TokenType;
import com.techtitans.dayflow.common.exception.DuplicateResourceException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.employee.dto.CreateEmployeeRequest;
import com.techtitans.dayflow.employee.dto.EmployeeResponse;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.employee.service.EmployeeService;
import com.techtitans.dayflow.notification.EmailService;
import com.techtitans.dayflow.notification.EmailTemplateService;
import com.techtitans.dayflow.user.entity.Role;
import com.techtitans.dayflow.user.entity.User;
import com.techtitans.dayflow.user.repository.RoleRepository;
import com.techtitans.dayflow.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeService Unit Tests")
class EmployeeServiceTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private TokenService tokenService;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;

    @InjectMocks
    private EmployeeService employeeService;

    private Role employeeRole;
    private CreateEmployeeRequest validRequest;

    @BeforeEach
    void setUp() {
        employeeRole = Role.builder().id(2L).name(RoleName.EMPLOYEE).build();
        validRequest = new CreateEmployeeRequest(
                "EMP001", "John", "Doe", "john@test.com",
                "1234567890", "123 Street", null, null,
                "Developer", "Engineering", null
        );
    }

    @Test
    @DisplayName("Create employee - success")
    void createEmployee_success() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(employeeRepository.existsByEmployeeCode("EMP001")).thenReturn(false);
        when(roleRepository.findByName(RoleName.EMPLOYEE)).thenReturn(Optional.of(employeeRole));

        User savedUser = User.builder()
                .id(1L).email("john@test.com").role(employeeRole)
                .accountStatus(AccountStatus.INVITED).build();
        when(userRepository.save(any())).thenReturn(savedUser);

        Employee savedEmployee = Employee.builder()
                .id(1L).user(savedUser).employeeCode("EMP001")
                .firstName("John").lastName("Doe").build();
        when(employeeRepository.save(any())).thenReturn(savedEmployee);
        when(tokenService.createToken(savedUser, TokenType.PASSWORD_SETUP)).thenReturn("invite-token");
        when(emailTemplateService.buildPasswordSetupEmail(anyString(), anyString())).thenReturn("<html/>");

        EmployeeResponse response = employeeService.createEmployee(validRequest);

        assertThat(response.employeeCode()).isEqualTo("EMP001");
        assertThat(response.firstName()).isEqualTo("John");
        verify(emailService).sendHtmlEmail(eq("john@test.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Create employee - duplicate email throws exception")
    void createEmployee_duplicateEmail() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("email");
    }

    @Test
    @DisplayName("Create employee - duplicate code throws exception")
    void createEmployee_duplicateCode() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(employeeRepository.existsByEmployeeCode("EMP001")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("EMP001");
    }

    @Test
    @DisplayName("Get employee by ID - not found throws exception")
    void getEmployeeById_notFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
