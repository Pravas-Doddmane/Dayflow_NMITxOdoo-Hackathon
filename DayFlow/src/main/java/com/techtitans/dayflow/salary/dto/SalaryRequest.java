package com.techtitans.dayflow.salary.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalaryRequest(
        @NotNull(message = "Basic salary is required")
        @Positive(message = "Basic salary must be positive")
        BigDecimal basicSalary,

        @PositiveOrZero(message = "HRA must be zero or positive")
        BigDecimal hra,

        @PositiveOrZero(message = "Allowances must be zero or positive")
        BigDecimal allowances,

        @PositiveOrZero(message = "Deductions must be zero or positive")
        BigDecimal deductions,

        @NotNull(message = "Effective from date is required")
        LocalDate effectiveFrom,

        LocalDate effectiveTo
) {}
