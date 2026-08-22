package com.techtitans.dayflow.salary.service;

import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.salary.dto.SalaryRequest;
import com.techtitans.dayflow.salary.dto.SalaryResponse;
import com.techtitans.dayflow.salary.entity.SalaryStructure;
import com.techtitans.dayflow.salary.repository.SalaryStructureRepository;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;

    // ==========================================
    // Admin: Create salary structure
    // ==========================================

    @Transactional
    public SalaryResponse createSalary(Long employeeId, SalaryRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        validateSalaryDates(request);

        BigDecimal hra = request.hra() != null ? request.hra() : BigDecimal.ZERO;
        BigDecimal allowances = request.allowances() != null ? request.allowances() : BigDecimal.ZERO;
        BigDecimal deductions = request.deductions() != null ? request.deductions() : BigDecimal.ZERO;
        BigDecimal netSalary = request.basicSalary().add(hra).add(allowances).subtract(deductions);

        if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Net salary cannot be negative");
        }

        SalaryStructure salary = SalaryStructure.builder()
                .employee(employee)
                .basicSalary(request.basicSalary())
                .hra(hra)
                .allowances(allowances)
                .deductions(deductions)
                .netSalary(netSalary)
                .effectiveFrom(request.effectiveFrom())
                .effectiveTo(request.effectiveTo())
                .build();

        salary = salaryStructureRepository.save(salary);
        log.info("Admin created salary structure for employee ID: {}", employeeId);
        return SalaryResponse.from(salary);
    }

    // ==========================================
    // Admin: Update salary structure
    // ==========================================

    @Transactional
    public SalaryResponse updateSalary(Long salaryId, SalaryRequest request) {
        SalaryStructure salary = salaryStructureRepository.findById(salaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary structure", "id", salaryId));

        validateSalaryDates(request);

        BigDecimal hra = request.hra() != null ? request.hra() : BigDecimal.ZERO;
        BigDecimal allowances = request.allowances() != null ? request.allowances() : BigDecimal.ZERO;
        BigDecimal deductions = request.deductions() != null ? request.deductions() : BigDecimal.ZERO;
        BigDecimal netSalary = request.basicSalary().add(hra).add(allowances).subtract(deductions);

        if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Net salary cannot be negative");
        }

        salary.setBasicSalary(request.basicSalary());
        salary.setHra(hra);
        salary.setAllowances(allowances);
        salary.setDeductions(deductions);
        salary.setNetSalary(netSalary);
        salary.setEffectiveFrom(request.effectiveFrom());
        salary.setEffectiveTo(request.effectiveTo());

        salary = salaryStructureRepository.save(salary);
        log.info("Admin updated salary structure ID: {}", salaryId);
        return SalaryResponse.from(salary);
    }

    // ==========================================
    // Admin: Get salary history for employee
    // ==========================================

    @Transactional(readOnly = true)
    public List<SalaryResponse> getEmployeeSalaryHistory(Long employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return salaryStructureRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId)
                .stream().map(SalaryResponse::from).toList();
    }

    // ==========================================
    // Employee: View own salary (read-only)
    // ==========================================

    @Transactional(readOnly = true)
    public List<SalaryResponse> getMySalary(Authentication authentication) {
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        User user = securityUser.getUser();

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));

        return salaryStructureRepository.findByEmployeeIdOrderByEffectiveFromDesc(employee.getId())
                .stream().map(SalaryResponse::from).toList();
    }

    // ==========================================
    // Helper
    // ==========================================

    private void validateSalaryDates(SalaryRequest request) {
        if (request.effectiveTo() != null && request.effectiveTo().isBefore(request.effectiveFrom())) {
            throw new BadRequestException("Effective to date must be after effective from date");
        }
    }
}
