package com.techtitans.dayflow.company.dto;

public record CompanyProfileUpdateRequest(
        String logoUrl,
        String tagline,
        String industry,
        String website,
        String contactEmail,
        String address,
        String city,
        String state,
        String country,
        String postalCode,
        String workingHours,
        String workingDays,
        String about,
        String leavePolicy,
        String emergencyContact
) {}
