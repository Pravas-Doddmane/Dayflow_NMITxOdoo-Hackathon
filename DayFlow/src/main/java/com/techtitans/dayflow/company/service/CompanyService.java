package com.techtitans.dayflow.company.service;

import com.techtitans.dayflow.common.exception.ForbiddenException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.company.dto.CompanyProfileResponse;
import com.techtitans.dayflow.company.dto.CompanyProfileUpdateRequest;
import com.techtitans.dayflow.company.entity.Company;
import com.techtitans.dayflow.company.repository.CompanyRepository;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.User;
import com.techtitans.dayflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CompanyProfileResponse getCompanyProfile(Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser.getCompany() == null) {
            throw new ResourceNotFoundException("No company associated with this account");
        }

        Company company = companyRepository.findById(currentUser.getCompany().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        String adminEmail = userRepository.findByCompanyIdAndRole_Name(company.getId(), com.techtitans.dayflow.common.enums.RoleName.ADMIN)
                .stream().findFirst().map(User::getEmail).orElse(currentUser.getEmail());

        return CompanyProfileResponse.from(company, adminEmail);
    }

    @Transactional
    public CompanyProfileResponse updateCompanyProfile(Authentication authentication, CompanyProfileUpdateRequest request) {
        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser.getCompany() == null) {
            throw new ResourceNotFoundException("No company associated with this admin account");
        }

        Company company = companyRepository.findById(currentUser.getCompany().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (request.logoUrl() != null) company.setLogoUrl(request.logoUrl());
        if (request.tagline() != null) company.setTagline(request.tagline());
        if (request.industry() != null) company.setIndustry(request.industry());
        if (request.website() != null) company.setWebsite(request.website());
        if (request.contactEmail() != null) company.setContactEmail(request.contactEmail());
        if (request.address() != null) company.setAddress(request.address());
        if (request.city() != null) company.setCity(request.city());
        if (request.state() != null) company.setState(request.state());
        if (request.country() != null) company.setCountry(request.country());
        if (request.postalCode() != null) company.setPostalCode(request.postalCode());
        if (request.workingHours() != null) company.setWorkingHours(request.workingHours());
        if (request.workingDays() != null) company.setWorkingDays(request.workingDays());
        if (request.about() != null) company.setAbout(request.about());
        if (request.leavePolicy() != null) company.setLeavePolicy(request.leavePolicy());
        if (request.emergencyContact() != null) company.setEmergencyContact(request.emergencyContact());

        company = companyRepository.save(company);
        log.info("Admin {} updated company profile for {}", currentUser.getEmail(), company.getName());

        return CompanyProfileResponse.from(company, currentUser.getEmail());
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser securityUser)) {
            throw new ForbiddenException("User is not authenticated");
        }
        return securityUser.getUser();
    }
}
