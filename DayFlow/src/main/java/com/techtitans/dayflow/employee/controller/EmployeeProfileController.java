package com.techtitans.dayflow.employee.controller;

import com.techtitans.dayflow.employee.dto.EmployeeProfileUpdateRequest;
import com.techtitans.dayflow.employee.dto.EmployeeResponse;
import com.techtitans.dayflow.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee — Profile", description = "Employee self-service profile endpoints")
public class EmployeeProfileController {

    private final EmployeeService employeeService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Get own profile")
    public ResponseEntity<EmployeeResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(employeeService.getMyProfile(authentication));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Update own profile (phone, address, profile picture only)")
    public ResponseEntity<EmployeeResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody EmployeeProfileUpdateRequest request) {
        return ResponseEntity.ok(employeeService.updateMyProfile(authentication, request));
    }
}
