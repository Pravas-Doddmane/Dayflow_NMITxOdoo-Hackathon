package com.techtitans.dayflow.attendance.controller;

import com.techtitans.dayflow.attendance.dto.AttendanceResponse;
import com.techtitans.dayflow.attendance.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance management endpoints")
public class AttendanceController {

    private final AttendanceService attendanceService;

    // ==========================================
    // Employee endpoints
    // ==========================================

    @PostMapping("/api/attendance/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Check in for today")
    public ResponseEntity<AttendanceResponse> checkIn(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkIn(authentication));
    }

    @PostMapping("/api/attendance/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Check out for today")
    public ResponseEntity<AttendanceResponse> checkOut(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkOut(authentication));
    }

    @GetMapping("/api/attendance/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Get own attendance records")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(authentication, from, to));
    }

    // ==========================================
    // Admin endpoints
    // ==========================================

    @GetMapping("/api/admin/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all attendance records (paginated, filterable)")
    public ResponseEntity<Page<AttendanceResponse>> getAllAttendance(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(attendanceService.getAllAttendance(employeeId, from, to, pageable));
    }

    @GetMapping("/api/admin/attendance/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get attendance for specific employee")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId, from, to));
    }
}
