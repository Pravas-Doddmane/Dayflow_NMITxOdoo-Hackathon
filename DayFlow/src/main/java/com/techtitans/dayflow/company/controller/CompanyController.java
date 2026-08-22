package com.techtitans.dayflow.company.controller;

import com.techtitans.dayflow.company.dto.CompanyProfileResponse;
import com.techtitans.dayflow.company.dto.CompanyProfileUpdateRequest;
import com.techtitans.dayflow.company.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Company Profile", description = "Company and organization profile management")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/api/company/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current company profile details (accessible by both admin and employees)")
    public ResponseEntity<CompanyProfileResponse> getCompanyProfile(Authentication authentication) {
        return ResponseEntity.ok(companyService.getCompanyProfile(authentication));
    }

    @PutMapping("/api/admin/company/profile")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update company profile details (admin only)")
    public ResponseEntity<CompanyProfileResponse> updateCompanyProfile(
            Authentication authentication,
            @RequestBody CompanyProfileUpdateRequest request) {
        return ResponseEntity.ok(companyService.updateCompanyProfile(authentication, request));
    }
}
