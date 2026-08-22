package com.techtitans.dayflow.leave;

import com.techtitans.dayflow.attendance.service.AttendanceService;
import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.LeaveStatus;
import com.techtitans.dayflow.common.enums.LeaveType;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.leave.dto.LeaveRequestDto;
import com.techtitans.dayflow.leave.dto.LeaveResponse;
import com.techtitans.dayflow.leave.dto.LeaveReviewRequest;
import com.techtitans.dayflow.leave.entity.LeaveRequest;
import com.techtitans.dayflow.leave.repository.LeaveRequestRepository;
import com.techtitans.dayflow.leave.service.LeaveService;
import com.techtitans.dayflow.notification.EmailService;
import com.techtitans.dayflow.notification.EmailTemplateService;
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

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LeaveService Unit Tests")
class LeaveServiceTest {

    @Mock private LeaveRequestRepository leaveRequestRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private AttendanceService attendanceService;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;

    @InjectMocks
    private LeaveService leaveService;

    private Employee employee;
    private User adminUser;
    private Authentication employeeAuth;
    private Authentication adminAuth;

    @BeforeEach
    void setUp() {
        Role empRole = Role.builder().id(2L).name(RoleName.EMPLOYEE).build();
        Role adminRole = Role.builder().id(1L).name(RoleName.ADMIN).build();

        User empUser = User.builder()
                .id(1L).email("emp@test.com").role(empRole)
                .accountStatus(AccountStatus.ACTIVE).build();
        employee = Employee.builder()
                .id(1L).user(empUser).employeeCode("EMP001")
                .firstName("John").lastName("Doe").build();

        adminUser = User.builder()
                .id(2L).email("admin@test.com").role(adminRole)
                .accountStatus(AccountStatus.ACTIVE).build();

        SecurityUser empSecUser = new SecurityUser(empUser);
        employeeAuth = new UsernamePasswordAuthenticationToken(empSecUser, null, empSecUser.getAuthorities());

        SecurityUser adminSecUser = new SecurityUser(adminUser);
        adminAuth = new UsernamePasswordAuthenticationToken(adminSecUser, null, adminSecUser.getAuthorities());
    }

    @Test
    @DisplayName("Apply for leave - success")
    void applyForLeave_success() {
        when(employeeRepository.findByUserId(1L)).thenReturn(Optional.of(employee));
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(3);
        LeaveRequestDto dto = new LeaveRequestDto(LeaveType.PAID, start, end, "Vacation", null);

        when(leaveRequestRepository.existsOverlappingLeave(1L, start, end)).thenReturn(false);
        LeaveRequest saved = LeaveRequest.builder()
                .id(1L).employee(employee).leaveType(LeaveType.PAID)
                .startDate(start).endDate(end).status(LeaveStatus.PENDING).build();
        when(leaveRequestRepository.save(any())).thenReturn(saved);

        LeaveResponse response = leaveService.applyForLeave(employeeAuth, dto);

        assertThat(response.status()).isEqualTo(LeaveStatus.PENDING);
        assertThat(response.leaveType()).isEqualTo(LeaveType.PAID);
    }

    @Test
    @DisplayName("Apply for leave - end before start throws exception")
    void applyForLeave_invalidDates() {
        when(employeeRepository.findByUserId(1L)).thenReturn(Optional.of(employee));
        LocalDate start = LocalDate.now().plusDays(5);
        LocalDate end = LocalDate.now().plusDays(2);

        assertThatThrownBy(() -> leaveService.applyForLeave(employeeAuth,
                new LeaveRequestDto(LeaveType.SICK, start, end, null, null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Start date must be before");
    }

    @Test
    @DisplayName("Approve leave - success")
    void approveLeave_success() {
        LeaveRequest pending = LeaveRequest.builder()
                .id(1L).employee(employee).leaveType(LeaveType.PAID)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(1))
                .status(LeaveStatus.PENDING).build();

        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(leaveRequestRepository.save(any())).thenReturn(pending);
        when(emailTemplateService.buildLeaveApprovedEmail(anyString(), anyString(), anyString(), anyString(), any()))
                .thenReturn("<html/>");

        LeaveResponse response = leaveService.approveLeave(1L, new LeaveReviewRequest("Approved!"), adminAuth);

        assertThat(response.status()).isEqualTo(LeaveStatus.APPROVED);
        verify(emailService).sendHtmlEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Reject leave - success")
    void rejectLeave_success() {
        LeaveRequest pending = LeaveRequest.builder()
                .id(1L).employee(employee).leaveType(LeaveType.SICK)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(2))
                .status(LeaveStatus.PENDING).build();

        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(leaveRequestRepository.save(any())).thenReturn(pending);
        when(emailTemplateService.buildLeaveRejectedEmail(anyString(), anyString(), anyString(), anyString(), any()))
                .thenReturn("<html/>");

        LeaveResponse response = leaveService.rejectLeave(1L, new LeaveReviewRequest("Not enough balance"), adminAuth);

        assertThat(response.status()).isEqualTo(LeaveStatus.REJECTED);
    }

    @Test
    @DisplayName("Cannot approve already approved leave")
    void approveLeave_alreadyApproved() {
        LeaveRequest approved = LeaveRequest.builder()
                .id(1L).employee(employee).status(LeaveStatus.APPROVED)
                .startDate(LocalDate.now()).endDate(LocalDate.now()).build();

        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(approved));

        assertThatThrownBy(() -> leaveService.approveLeave(1L, new LeaveReviewRequest(null), adminAuth))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    @DisplayName("Cannot approve rejected leave")
    void approveLeave_alreadyRejected() {
        LeaveRequest rejected = LeaveRequest.builder()
                .id(1L).employee(employee).status(LeaveStatus.REJECTED)
                .startDate(LocalDate.now()).endDate(LocalDate.now()).build();

        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(rejected));

        assertThatThrownBy(() -> leaveService.approveLeave(1L, new LeaveReviewRequest(null), adminAuth))
                .isInstanceOf(BadRequestException.class);
    }
}
