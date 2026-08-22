package com.techtitans.dayflow.attendance.service;

import com.techtitans.dayflow.attendance.dto.AttendanceResponse;
import com.techtitans.dayflow.attendance.entity.Attendance;
import com.techtitans.dayflow.attendance.repository.AttendanceRepository;
import com.techtitans.dayflow.common.enums.AttendanceStatus;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.DuplicateResourceException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // ==========================================
    // Employee: Check In
    // ==========================================

    @Transactional
    public AttendanceResponse checkIn(Authentication authentication) {
        Employee employee = getAuthenticatedEmployee(authentication);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        // Prevent duplicate check-in
        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(employee.getId(), today)) {
            throw new DuplicateResourceException("You have already checked in today");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(today)
                .checkIn(Instant.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        attendance = attendanceRepository.save(attendance);
        log.info("Employee {} checked in at {}", employee.getEmployeeCode(), attendance.getCheckIn());
        return AttendanceResponse.from(attendance);
    }

    // ==========================================
    // Employee: Check Out
    // ==========================================

    @Transactional
    public AttendanceResponse checkOut(Authentication authentication) {
        Employee employee = getAuthenticatedEmployee(authentication);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElseThrow(() -> new BadRequestException("You have not checked in today"));

        if (attendance.getCheckIn() == null) {
            throw new BadRequestException("Cannot check out: no check-in recorded for today");
        }
        if (attendance.getCheckOut() != null) {
            throw new BadRequestException("You have already checked out today");
        }

        Instant now = Instant.now();
        attendance.setCheckOut(now);

        // Calculate working hours
        Duration duration = Duration.between(attendance.getCheckIn(), now);
        BigDecimal hours = BigDecimal.valueOf(duration.toMinutes())
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        attendance.setWorkingHours(hours);

        // Determine status based on hours
        if (hours.compareTo(BigDecimal.valueOf(4)) < 0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        attendance = attendanceRepository.save(attendance);
        log.info("Employee {} checked out. Working hours: {}", employee.getEmployeeCode(), hours);
        return AttendanceResponse.from(attendance);
    }

    // ==========================================
    // Employee: View Own Attendance
    // ==========================================

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendance(Authentication authentication, LocalDate from, LocalDate to) {
        Employee employee = getAuthenticatedEmployee(authentication);

        List<Attendance> records;
        if (from != null && to != null) {
            records = attendanceRepository.findByEmployeeIdAndDateRange(employee.getId(), from, to);
        } else {
            records = attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employee.getId());
        }

        return records.stream().map(AttendanceResponse::from).toList();
    }

    // ==========================================
    // Admin: View All Attendance (paginated, filtered)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getAllAttendance(Long employeeId, LocalDate from, LocalDate to, Pageable pageable) {
        return attendanceRepository.findAllByFilters(employeeId, from, to, pageable)
                .map(AttendanceResponse::from);
    }

    // ==========================================
    // Admin: View Employee Attendance
    // ==========================================

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getEmployeeAttendance(Long employeeId, LocalDate from, LocalDate to) {
        // Verify employee exists
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        List<Attendance> records;
        if (from != null && to != null) {
            records = attendanceRepository.findByEmployeeIdAndDateRange(employeeId, from, to);
        } else {
            records = attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employeeId);
        }

        return records.stream().map(AttendanceResponse::from).toList();
    }

    // ==========================================
    // Internal: Mark attendance as LEAVE (used by leave approval)
    // ==========================================

    @Transactional
    public void markAttendanceAsLeave(Long employeeId, LocalDate date) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, date)
                .orElseGet(() -> Attendance.builder()
                        .employee(employee)
                        .attendanceDate(date)
                        .status(AttendanceStatus.LEAVE)
                        .build());

        attendance.setStatus(AttendanceStatus.LEAVE);
        attendanceRepository.save(attendance);
    }

    // ==========================================
    // Helper
    // ==========================================

    private Employee getAuthenticatedEmployee(Authentication authentication) {
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        User user = securityUser.getUser();
        return employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
    }
}
