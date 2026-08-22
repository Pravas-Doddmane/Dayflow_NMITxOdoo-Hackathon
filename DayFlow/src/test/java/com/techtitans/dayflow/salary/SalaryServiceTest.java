package com.techtitans.dayflow.salary;

import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.salary.dto.SalaryRequest;
import com.techtitans.dayflow.salary.dto.SalaryResponse;
import com.techtitans.dayflow.salary.entity.SalaryStructure;
import com.techtitans.dayflow.salary.repository.SalaryStructureRepository;
import com.techtitans.dayflow.salary.service.SalaryService;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.Role;
import com.techtitans.dayflow.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SalaryService Unit Tests")
class SalaryServiceTest {

    @Mock private SalaryStructureRepository salaryStructureRepository;
    @Mock private EmployeeRepository employeeRepository;

    @InjectMocks
    private SalaryService salaryService;

    private Employee employee;
    private Authentication employeeAuth;

    @BeforeEach
    void setUp() {
        Role role = Role.builder().id(2L).name(RoleName.EMPLOYEE).build();
        User user = User.builder()
                .id(1L).email("emp@test.com").role(role)
                .accountStatus(AccountStatus.ACTIVE).build();
        employee = Employee.builder()
                .id(1L).user(user).employeeCode("EMP001")
                .firstName("John").lastName("Doe").build();

        SecurityUser secUser = new SecurityUser(user);
        employeeAuth = new UsernamePasswordAuthenticationToken(secUser, null, secUser.getAuthorities());
    }

    @Test
    @DisplayName("Admin creates salary - net salary is calculated correctly")
    void createSalary_netSalaryCalculation() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        SalaryStructure saved = SalaryStructure.builder()
                .id(1L).employee(employee)
                .basicSalary(new BigDecimal("50000"))
                .hra(new BigDecimal("10000"))
                .allowances(new BigDecimal("5000"))
                .deductions(new BigDecimal("3000"))
                .netSalary(new BigDecimal("62000"))
                .effectiveFrom(LocalDate.now())
                .build();
        when(salaryStructureRepository.save(any())).thenReturn(saved);

        SalaryRequest request = new SalaryRequest(
                new BigDecimal("50000"),
                new BigDecimal("10000"),
                new BigDecimal("5000"),
                new BigDecimal("3000"),
                LocalDate.now(), null);

        SalaryResponse response = salaryService.createSalary(1L, request);

        assertThat(response.netSalary()).isEqualByComparingTo(new BigDecimal("62000"));
        verify(salaryStructureRepository).save(any());
    }

    @Test
    @DisplayName("Employee can view own salary")
    void getMySalary_success() {
        when(employeeRepository.findByUserId(1L)).thenReturn(Optional.of(employee));
        SalaryStructure salary = SalaryStructure.builder()
                .id(1L).employee(employee)
                .basicSalary(new BigDecimal("50000"))
                .netSalary(new BigDecimal("55000"))
                .effectiveFrom(LocalDate.now())
                .build();
        when(salaryStructureRepository.findByEmployeeIdOrderByEffectiveFromDesc(1L))
                .thenReturn(List.of(salary));

        List<SalaryResponse> response = salaryService.getMySalary(employeeAuth);

        assertThat(response).hasSize(1);
        assertThat(response.get(0).basicSalary()).isEqualByComparingTo(new BigDecimal("50000"));
    }

    @Test
    @DisplayName("Invalid date range throws exception")
    void createSalary_invalidDates() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        SalaryRequest request = new SalaryRequest(
                new BigDecimal("50000"), null, null, null,
                LocalDate.now().plusDays(10),
                LocalDate.now()); // effectiveTo before effectiveFrom

        assertThatThrownBy(() -> salaryService.createSalary(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Effective to date");
    }
}
