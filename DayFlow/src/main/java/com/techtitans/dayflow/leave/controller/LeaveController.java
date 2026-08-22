package com.techtitans.dayflow.leave.controller;

import com.techtitans.dayflow.common.enums.LeaveStatus;
import com.techtitans.dayflow.leave.dto.LeaveRequestDto;
import com.techtitans.dayflow.leave.dto.LeaveResponse;
import com.techtitans.dayflow.leave.dto.LeaveReviewRequest;
import com.techtitans.dayflow.leave.service.LeaveService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Leave request and approval endpoints")
public class LeaveController {

    private final LeaveService leaveService;

    // ==========================================
    // Employee endpoints
    // ==========================================

    @PostMapping("/api/leaves")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Apply for leave")
    public ResponseEntity<LeaveResponse> applyForLeave(
            Authentication authentication,
            @Valid @RequestBody LeaveRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyForLeave(authentication, request));
    }

    @GetMapping("/api/leaves/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "View own leave requests")
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(Authentication authentication) {
        return ResponseEntity.ok(leaveService.getMyLeaveRequests(authentication));
    }

    // ==========================================
    // Admin endpoints
    // ==========================================

    @GetMapping("/api/admin/leaves")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all leave requests (paginated, filterable by status)")
    public ResponseEntity<Page<LeaveResponse>> getAllLeaves(
            @RequestParam(required = false) LeaveStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests(status, pageable));
    }

    @PutMapping("/api/admin/leaves/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a leave request")
    public ResponseEntity<LeaveResponse> approveLeave(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveReviewRequest request,
            Authentication authentication) {
        LeaveReviewRequest reviewRequest = request != null ? request : new LeaveReviewRequest(null);
        return ResponseEntity.ok(leaveService.approveLeave(id, reviewRequest, authentication));
    }

    @PutMapping("/api/admin/leaves/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a leave request")
    public ResponseEntity<LeaveResponse> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveReviewRequest request,
            Authentication authentication) {
        LeaveReviewRequest reviewRequest = request != null ? request : new LeaveReviewRequest(null);
        return ResponseEntity.ok(leaveService.rejectLeave(id, reviewRequest, authentication));
    }
}
