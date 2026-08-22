package com.techtitans.dayflow.employee.controller;

import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.employee.dto.CreateEmployeeRequest;
import com.techtitans.dayflow.employee.dto.EmployeeResponse;
import com.techtitans.dayflow.employee.dto.UpdateEmployeeRequest;
import com.techtitans.dayflow.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Employees", description = "Admin endpoints for employee management")
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @Operation(summary = "Create a new employee (sends invitation email)")
    public ResponseEntity<EmployeeResponse> createEmployee(
            org.springframework.security.core.Authentication authentication,
            @Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all employees (paginated)")
    public ResponseEntity<Page<EmployeeResponse>> getAllEmployees(
            org.springframework.security.core.Authentication authentication,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(employeeService.getAllEmployees(authentication, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<EmployeeResponse> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee information")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update employee account status (ACTIVE/DISABLED)")
    public ResponseEntity<EmployeeResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam AccountStatus status) {
        return ResponseEntity.ok(employeeService.updateAccountStatus(id, status));
    }
}
