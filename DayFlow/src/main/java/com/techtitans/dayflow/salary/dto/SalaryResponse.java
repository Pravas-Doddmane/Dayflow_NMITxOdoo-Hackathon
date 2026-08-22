package com.techtitans.dayflow.salary.dto;

import com.techtitans.dayflow.salary.entity.SalaryStructure;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record SalaryResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        BigDecimal basicSalary,
        BigDecimal hra,
        BigDecimal allowances,
        BigDecimal deductions,
        BigDecimal netSalary,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        Instant createdAt,
        Instant updatedAt
) {
    public static SalaryResponse from(SalaryStructure salary) {
        return new SalaryResponse(
                salary.getId(),
                salary.getEmployee().getId(),
                salary.getEmployee().getEmployeeCode(),
                salary.getEmployee().getFullName(),
                salary.getBasicSalary(),
                salary.getHra(),
                salary.getAllowances(),
                salary.getDeductions(),
                salary.getNetSalary(),
                salary.getEffectiveFrom(),
                salary.getEffectiveTo(),
                salary.getCreatedAt(),
                salary.getUpdatedAt()
        );
    }
}
