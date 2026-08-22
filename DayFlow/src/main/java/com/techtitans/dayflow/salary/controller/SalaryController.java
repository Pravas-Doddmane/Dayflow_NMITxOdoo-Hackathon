package com.techtitans.dayflow.salary.controller;

import com.techtitans.dayflow.salary.dto.SalaryRequest;
import com.techtitans.dayflow.salary.dto.SalaryResponse;
import com.techtitans.dayflow.salary.service.SalaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Salary", description = "Salary management endpoints")
public class SalaryController {

    private final SalaryService salaryService;

    // ==========================================
    // Employee endpoint
    // ==========================================

    @GetMapping("/api/salary/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "View own salary history (read-only)")
    public ResponseEntity<List<SalaryResponse>> getMySalary(Authentication authentication) {
        return ResponseEntity.ok(salaryService.getMySalary(authentication));
    }

    // ==========================================
    // Admin endpoints
    // ==========================================

    @GetMapping("/api/admin/salary/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get salary history for employee")
    public ResponseEntity<List<SalaryResponse>> getEmployeeSalary(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryService.getEmployeeSalaryHistory(employeeId));
    }

    @PostMapping("/api/admin/salary/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create salary structure for employee")
    public ResponseEntity<SalaryResponse> createSalary(
            @PathVariable Long employeeId,
            @Valid @RequestBody SalaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(salaryService.createSalary(employeeId, request));
    }

    @PutMapping("/api/admin/salary/{salaryId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update existing salary structure")
    public ResponseEntity<SalaryResponse> updateSalary(
            @PathVariable Long salaryId,
            @Valid @RequestBody SalaryRequest request) {
        return ResponseEntity.ok(salaryService.updateSalary(salaryId, request));
    }
}
