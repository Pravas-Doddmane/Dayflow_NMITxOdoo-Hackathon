package com.techtitans.dayflow.company.dto;

import com.techtitans.dayflow.company.entity.Company;
import java.time.Instant;

public record CompanyProfileResponse(
        Long id,
        String name,
        String code,
        String logoUrl,
        String tagline,
        String industry,
        String website,
        String contactEmail,
        String phone,
        String address,
        String city,
        String state,
        String country,
        String postalCode,
        String workingHours,
        String workingDays,
        String about,
        String leavePolicy,
        String emergencyContact,
        String adminEmail,
        Instant createdAt,
        Instant updatedAt
) {
    public static CompanyProfileResponse from(Company company, String adminEmail) {
        return new CompanyProfileResponse(
                company.getId(),
                company.getName(),
                company.getCode(),
                company.getLogoUrl(),
                company.getTagline(),
                company.getIndustry(),
                company.getWebsite(),
                company.getContactEmail(),
                company.getPhone(),
                company.getAddress(),
                company.getCity(),
                company.getState(),
                company.getCountry(),
                company.getPostalCode(),
                company.getWorkingHours(),
                company.getWorkingDays(),
                company.getAbout(),
                company.getLeavePolicy(),
                company.getEmergencyContact(),
                adminEmail,
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
