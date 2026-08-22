package com.techtitans.dayflow.employee.dto;

import jakarta.validation.constraints.Size;

public record EmployeeProfileUpdateRequest(
        @Size(max = 20, message = "Phone must be at most 20 characters")
        String phone,

        String address,
        String city,
        String state,
        String country,
        String postalCode,
        String alternateEmail,
        String aboutMe,
        String skills,
        String linkedinUrl,
        String githubUrl,
        String emergencyContactName,
        String emergencyContactRelation,
        String emergencyContactPhone,
        String highestQualification,
        String institution,
        String profilePictureUrl
) {}
