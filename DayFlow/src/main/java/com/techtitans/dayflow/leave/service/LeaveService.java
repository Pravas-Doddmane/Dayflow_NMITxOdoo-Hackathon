package com.techtitans.dayflow.leave.service;

import com.techtitans.dayflow.attendance.service.AttendanceService;
import com.techtitans.dayflow.common.enums.LeaveStatus;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.ForbiddenException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.leave.dto.LeaveRequestDto;
import com.techtitans.dayflow.leave.dto.LeaveResponse;
import com.techtitans.dayflow.leave.dto.LeaveReviewRequest;
import com.techtitans.dayflow.leave.entity.LeaveRequest;
import com.techtitans.dayflow.leave.repository.LeaveRequestRepository;
import com.techtitans.dayflow.notification.EmailService;
import com.techtitans.dayflow.notification.EmailTemplateService;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceService attendanceService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    // ==========================================
    // Employee: Apply for Leave
    // ==========================================

    @Transactional
    public LeaveResponse applyForLeave(Authentication authentication, LeaveRequestDto request) {
        Employee employee = getAuthenticatedEmployee(authentication);

        // Validate dates
        if (request.startDate().isAfter(request.endDate())) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }
        if (request.startDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave start date cannot be in the past");
        }

        // Check overlapping leave
        if (leaveRequestRepository.existsOverlappingLeave(employee.getId(), request.startDate(), request.endDate())) {
            throw new BadRequestException("You already have an overlapping leave request for this period");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .leaveType(request.leaveType())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .remarks(request.remarks())
                .attachmentUrl(request.attachmentUrl())
                .status(LeaveStatus.PENDING)
                .build();

        leave = leaveRequestRepository.save(leave);
        log.info("Employee {} applied for {} leave from {} to {}",
                employee.getEmployeeCode(), request.leaveType(), request.startDate(), request.endDate());
        return LeaveResponse.from(leave);
    }

    // ==========================================
    // Employee: View Own Leave Requests
    // ==========================================

    @Transactional(readOnly = true)
    public List<LeaveResponse> getMyLeaveRequests(Authentication authentication) {
        Employee employee = getAuthenticatedEmployee(authentication);
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
                .stream().map(LeaveResponse::from).toList();
    }

    // ==========================================
    // Admin: View All Leave Requests (paginated)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getAllLeaveRequests(LeaveStatus status, Pageable pageable) {
        return getAllLeaveRequests(null, status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getAllLeaveRequests(Authentication authentication, LeaveStatus status, Pageable pageable) {
        Long companyId = null;
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUser securityUser) {
            if (securityUser.getUser().getCompany() != null) {
                companyId = securityUser.getUser().getCompany().getId();
            }
        }

        final Long finalCompanyId = companyId;
        org.springframework.data.jpa.domain.Specification<LeaveRequest> spec = (root, query, cb) -> {
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("employee", jakarta.persistence.criteria.JoinType.INNER);
            }
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (finalCompanyId != null) {
                predicates.add(cb.equal(root.get("employee").get("company").get("id"), finalCompanyId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return leaveRequestRepository.findAll(spec, pageable)
                .map(LeaveResponse::from);
    }

    // ==========================================
    // Admin: Approve Leave
    // ==========================================

    @Transactional
    public LeaveResponse approveLeave(Long leaveId, LeaveReviewRequest reviewRequest, Authentication authentication) {
        LeaveRequest leave = getLeaveOrThrow(leaveId);
        User reviewer = getAuthenticatedUser(authentication);

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING leave requests can be approved. Current status: " + leave.getStatus());
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setReviewedBy(reviewer);
        leave.setAdminComment(reviewRequest.comment());
        leave.setReviewedAt(Instant.now());
        leave = leaveRequestRepository.save(leave);

        // Mark attendance as LEAVE for all leave days
        LocalDate date = leave.getStartDate();
        while (!date.isAfter(leave.getEndDate())) {
            attendanceService.markAttendanceAsLeave(leave.getEmployee().getId(), date);
            date = date.plusDays(1);
        }

        // Send notification (async)
        String firstName = leave.getEmployee().getFirstName();
        String emailBody = emailTemplateService.buildLeaveApprovedEmail(
                firstName,
                leave.getLeaveType().name(),
                leave.getStartDate().toString(),
                leave.getEndDate().toString(),
                reviewRequest.comment()
        );
        emailService.sendHtmlEmail(leave.getEmployee().getUser().getEmail(),
                "DayFlow HRMS — Leave Request Approved", emailBody);

        log.info("Admin {} approved leave ID: {} for employee {}",
                reviewer.getEmail(), leaveId, leave.getEmployee().getEmployeeCode());
        return LeaveResponse.from(leave);
    }

    // ==========================================
    // Admin: Reject Leave
    // ==========================================

    @Transactional
    public LeaveResponse rejectLeave(Long leaveId, LeaveReviewRequest reviewRequest, Authentication authentication) {
        LeaveRequest leave = getLeaveOrThrow(leaveId);
        User reviewer = getAuthenticatedUser(authentication);

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING leave requests can be rejected. Current status: " + leave.getStatus());
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setReviewedBy(reviewer);
        leave.setAdminComment(reviewRequest.comment());
        leave.setReviewedAt(Instant.now());
        leave = leaveRequestRepository.save(leave);

        // Send notification (async)
        String firstName = leave.getEmployee().getFirstName();
        String emailBody = emailTemplateService.buildLeaveRejectedEmail(
                firstName,
                leave.getLeaveType().name(),
                leave.getStartDate().toString(),
                leave.getEndDate().toString(),
                reviewRequest.comment()
        );
        emailService.sendHtmlEmail(leave.getEmployee().getUser().getEmail(),
                "DayFlow HRMS — Leave Request Update", emailBody);

        log.info("Admin {} rejected leave ID: {} for employee {}",
                reviewer.getEmail(), leaveId, leave.getEmployee().getEmployeeCode());
        return LeaveResponse.from(leave);
    }

    // ==========================================
    // Helpers
    // ==========================================

    private LeaveRequest getLeaveOrThrow(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request", "id", id));
    }

    private Employee getAuthenticatedEmployee(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return securityUser.getUser();
    }
}
