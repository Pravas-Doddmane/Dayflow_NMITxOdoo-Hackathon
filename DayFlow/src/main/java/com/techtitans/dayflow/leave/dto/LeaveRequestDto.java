package com.techtitans.dayflow.leave.dto;

import com.techtitans.dayflow.common.enums.LeaveType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LeaveRequestDto(
        @NotNull(message = "Leave type is required")
        LeaveType leaveType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        String remarks,
        String attachmentUrl
) {}
