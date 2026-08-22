package com.techtitans.dayflow.attendance;

import com.techtitans.dayflow.attendance.dto.AttendanceResponse;
import com.techtitans.dayflow.attendance.entity.Attendance;
import com.techtitans.dayflow.attendance.repository.AttendanceRepository;
import com.techtitans.dayflow.attendance.service.AttendanceService;
import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.AttendanceStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.DuplicateResourceException;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
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

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AttendanceService Unit Tests")
class AttendanceServiceTest {

    @Mock private AttendanceRepository attendanceRepository;
    @Mock private EmployeeRepository employeeRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private Employee employee;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        Role role = Role.builder().id(2L).name(RoleName.EMPLOYEE).build();
        User user = User.builder()
                .id(1L).email("emp@test.com").role(role)
                .accountStatus(AccountStatus.ACTIVE).build();
        employee = Employee.builder()
                .id(1L).user(user).employeeCode("EMP001")
                .firstName("John").lastName("Doe").build();

        SecurityUser securityUser = new SecurityUser(user);
        authentication = new UsernamePasswordAuthenticationToken(securityUser, null, securityUser.getAuthorities());

        when(employeeRepository.findByUserId(1L)).thenReturn(Optional.of(employee));
    }

    @Test
    @DisplayName("Check in - success")
    void checkIn_success() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(1L, today)).thenReturn(false);

        Attendance savedAttendance = Attendance.builder()
                .id(1L).employee(employee).attendanceDate(today)
                .checkIn(Instant.now()).status(AttendanceStatus.PRESENT).build();
        when(attendanceRepository.save(any())).thenReturn(savedAttendance);

        AttendanceResponse response = attendanceService.checkIn(authentication);

        assertThat(response.attendanceDate()).isEqualTo(today);
        assertThat(response.checkIn()).isNotNull();
        assertThat(response.checkOut()).isNull();
    }

    @Test
    @DisplayName("Check in - duplicate check-in throws exception")
    void checkIn_duplicate() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(1L, today)).thenReturn(true);

        assertThatThrownBy(() -> attendanceService.checkIn(authentication))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already checked in");
    }

    @Test
    @DisplayName("Check out - success")
    void checkOut_success() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Attendance existing = Attendance.builder()
                .id(1L).employee(employee).attendanceDate(today)
                .checkIn(Instant.now().minusSeconds(3600))
                .status(AttendanceStatus.PRESENT).build();

        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(1L, today))
                .thenReturn(Optional.of(existing));
        when(attendanceRepository.save(any())).thenReturn(existing);

        AttendanceResponse response = attendanceService.checkOut(authentication);

        assertThat(response.checkOut()).isNotNull();
        assertThat(response.workingHours()).isPositive();
    }

    @Test
    @DisplayName("Check out without check-in throws exception")
    void checkOut_withoutCheckIn() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(1L, today))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> attendanceService.checkOut(authentication))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not checked in");
    }

    @Test
    @DisplayName("Double checkout throws exception")
    void checkOut_alreadyCheckedOut() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Attendance existing = Attendance.builder()
                .id(1L).employee(employee).attendanceDate(today)
                .checkIn(Instant.now().minusSeconds(3600))
                .checkOut(Instant.now())
                .status(AttendanceStatus.PRESENT).build();

        when(attendanceRepository.findByEmployeeIdAndAttendanceDate(1L, today))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> attendanceService.checkOut(authentication))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already checked out");
    }
}
