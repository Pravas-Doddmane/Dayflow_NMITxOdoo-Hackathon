package com.techtitans.dayflow.employee.dto;

import com.techtitans.dayflow.common.enums.Gender;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateEmployeeRequest(
        @NotBlank(message = "Employee code is required")
        @Size(max = 50, message = "Employee code must be at most 50 characters")
        String employeeCode,

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must be at most 100 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must be at most 100 characters")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        @Size(max = 20, message = "Phone must be at most 20 characters")
        String phone,

        String address,

        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        Gender gender,

        @Size(max = 150, message = "Designation must be at most 150 characters")
        String designation,

        @Size(max = 150, message = "Department must be at most 150 characters")
        String department,

        LocalDate joiningDate
) {}
