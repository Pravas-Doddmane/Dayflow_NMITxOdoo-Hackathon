package com.techtitans.dayflow.leave.dto;

import com.techtitans.dayflow.common.enums.LeaveStatus;
import com.techtitans.dayflow.common.enums.LeaveType;
import com.techtitans.dayflow.leave.entity.LeaveRequest;

import java.time.Instant;
import java.time.LocalDate;

public record LeaveResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        LeaveType leaveType,
        LocalDate startDate,
        LocalDate endDate,
        String remarks,
        String attachmentUrl,
        LeaveStatus status,
        Long reviewedById,
        String adminComment,
        Instant reviewedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static LeaveResponse from(LeaveRequest leave) {
        return new LeaveResponse(
                leave.getId(),
                leave.getEmployee().getId(),
                leave.getEmployee().getEmployeeCode(),
                leave.getEmployee().getFullName(),
                leave.getLeaveType(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getRemarks(),
                leave.getAttachmentUrl(),
                leave.getStatus(),
                leave.getReviewedBy() != null ? leave.getReviewedBy().getId() : null,
                leave.getAdminComment(),
                leave.getReviewedAt(),
                leave.getCreatedAt(),
                leave.getUpdatedAt()
        );
    }
}
