package com.techtitans.dayflow.employee.dto;

import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.EmploymentStatus;
import com.techtitans.dayflow.common.enums.Gender;
import com.techtitans.dayflow.employee.entity.Employee;

import java.time.Instant;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone,
        String address,
        LocalDate dateOfBirth,
        Gender gender,
        String profilePictureUrl,
        String designation,
        String department,
        LocalDate joiningDate,
        EmploymentStatus employmentStatus,
        AccountStatus accountStatus,
        boolean emailVerified,
        Long userId,
        Instant createdAt,
        Instant updatedAt
) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getFullName(),
                employee.getUser().getEmail(),
                employee.getPhone(),
                employee.getAddress(),
                employee.getDateOfBirth(),
                employee.getGender(),
                employee.getProfilePictureUrl(),
                employee.getDesignation(),
                employee.getDepartment(),
                employee.getJoiningDate(),
                employee.getEmploymentStatus(),
                employee.getUser().getAccountStatus(),
                employee.getUser().isEmailVerified(),
                employee.getUser().getId(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}
