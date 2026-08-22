package com.techtitans.dayflow.attendance.dto;

import com.techtitans.dayflow.attendance.entity.Attendance;
import com.techtitans.dayflow.common.enums.AttendanceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record AttendanceResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        LocalDate attendanceDate,
        Instant checkIn,
        Instant checkOut,
        AttendanceStatus status,
        BigDecimal workingHours,
        Instant createdAt,
        Instant updatedAt
) {
    public static AttendanceResponse from(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getEmployee().getId(),
                attendance.getEmployee().getEmployeeCode(),
                attendance.getEmployee().getFullName(),
                attendance.getAttendanceDate(),
                attendance.getCheckIn(),
                attendance.getCheckOut(),
                attendance.getStatus(),
                attendance.getWorkingHours(),
                attendance.getCreatedAt(),
                attendance.getUpdatedAt()
        );
    }
}
