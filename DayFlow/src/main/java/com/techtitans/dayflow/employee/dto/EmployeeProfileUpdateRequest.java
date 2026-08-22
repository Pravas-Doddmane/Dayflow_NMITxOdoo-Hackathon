package com.techtitans.dayflow.employee.dto;

import jakarta.validation.constraints.Size;

public record EmployeeProfileUpdateRequest(
        @Size(max = 20, message = "Phone must be at most 20 characters")
        String phone,

        String address,

        String profilePictureUrl
) {}
