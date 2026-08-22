package com.techtitans.dayflow.employee.service;

import com.techtitans.dayflow.auth.service.TokenService;
import com.techtitans.dayflow.common.enums.AccountStatus;
import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.common.enums.TokenType;
import com.techtitans.dayflow.common.exception.BadRequestException;
import com.techtitans.dayflow.common.exception.DuplicateResourceException;
import com.techtitans.dayflow.common.exception.ForbiddenException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.employee.dto.CreateEmployeeRequest;
import com.techtitans.dayflow.employee.dto.EmployeeProfileUpdateRequest;
import com.techtitans.dayflow.employee.dto.EmployeeResponse;
import com.techtitans.dayflow.employee.dto.UpdateEmployeeRequest;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.notification.EmailService;
import com.techtitans.dayflow.notification.EmailTemplateService;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.Role;
import com.techtitans.dayflow.user.entity.User;
import com.techtitans.dayflow.user.repository.RoleRepository;
import com.techtitans.dayflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    // ==========================================
    // Admin: Create Employee
    // ==========================================

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        return createEmployee(null, request);
    }

    @Transactional
    public EmployeeResponse createEmployee(Authentication authentication, CreateEmployeeRequest request) {
        com.techtitans.dayflow.company.entity.Company company = null;
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUser securityUser) {
            company = securityUser.getUser().getCompany();
        }

        // Validate duplicates per company
        if (company != null) {
            if (userRepository.existsByEmailAndCompanyId(request.email().trim().toLowerCase(), company.getId())) {
                throw new DuplicateResourceException("An account with email '" + request.email() + "' already exists in this company");
            }
            if (employeeRepository.existsByEmployeeCodeAndCompanyId(request.employeeCode(), company.getId())) {
                throw new DuplicateResourceException("Employee code '" + request.employeeCode() + "' is already in use in this company");
            }
        } else {
            if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
                throw new DuplicateResourceException("An account with email '" + request.email() + "' already exists");
            }
            if (employeeRepository.existsByEmployeeCode(request.employeeCode())) {
                throw new DuplicateResourceException("Employee code '" + request.employeeCode() + "' is already in use");
            }
        }

        // Load EMPLOYEE role
        Role employeeRole = roleRepository.findByName(RoleName.EMPLOYEE)
                .orElseThrow(() -> new ResourceNotFoundException("EMPLOYEE role not found. Ensure database is seeded."));

        // Create user account (no password yet — invitation pending)
        User user = User.builder()
                .email(request.email())
                .role(employeeRole)
                .company(company)
                .accountStatus(AccountStatus.INVITED)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);

        // Create employee record
        Employee employee = Employee.builder()
                .user(user)
                .company(company)
                .employeeCode(request.employeeCode())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .address(request.address())
                .dateOfBirth(request.dateOfBirth())
                .gender(request.gender())
                .designation(request.designation())
                .department(request.department())
                .joiningDate(request.joiningDate())
                .build();
        employee = employeeRepository.save(employee);

        // Generate invitation token
        String rawToken = tokenService.createToken(user, TokenType.PASSWORD_SETUP);

        // Send invitation email (async — happens after transaction commits)
        final String firstName = employee.getFirstName();
        final String email = user.getEmail();
        final String emailBody = emailTemplateService.buildPasswordSetupEmail(firstName, rawToken);
        emailService.sendHtmlEmail(email, "Welcome to DayFlow HRMS — Set Up Your Account", emailBody);

        log.info("Created employee {} (ID: {}) with user account ID: {}", employee.getEmployeeCode(), employee.getId(), user.getId());
        return EmployeeResponse.from(employee);
    }

    // ==========================================
    // Admin: Get All Employees (paginated)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return getAllEmployees(null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(Authentication authentication, Pageable pageable) {
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUser securityUser) {
            com.techtitans.dayflow.company.entity.Company company = securityUser.getUser().getCompany();
            if (company != null) {
                return employeeRepository.findAllByCompanyIdWithUser(company.getId(), pageable)
                        .map(EmployeeResponse::from);
            }
        }
        return employeeRepository.findAllWithUser(pageable)
                .map(EmployeeResponse::from);
    }

    // ==========================================
    // Admin: Get Employee by ID
    // ==========================================

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return EmployeeResponse.from(employee);
    }

    // ==========================================
    // Admin: Update Employee
    // ==========================================

    @Transactional
    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.firstName() != null) employee.setFirstName(request.firstName());
        if (request.lastName() != null) employee.setLastName(request.lastName());
        if (request.phone() != null) employee.setPhone(request.phone());
        if (request.address() != null) employee.setAddress(request.address());
        if (request.dateOfBirth() != null) employee.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null) employee.setGender(request.gender());
        if (request.designation() != null) employee.setDesignation(request.designation());
        if (request.department() != null) employee.setDepartment(request.department());
        if (request.joiningDate() != null) employee.setJoiningDate(request.joiningDate());
        if (request.employmentStatus() != null) employee.setEmploymentStatus(request.employmentStatus());

        employee = employeeRepository.save(employee);
        log.info("Admin updated employee ID: {}", id);
        return EmployeeResponse.from(employee);
    }

    // ==========================================
    // Admin: Update Account Status
    // ==========================================

    @Transactional
    public EmployeeResponse updateAccountStatus(Long id, AccountStatus newStatus) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.getUser().setAccountStatus(newStatus);
        userRepository.save(employee.getUser());

        log.info("Admin changed account status to {} for employee ID: {}", newStatus, id);
        return EmployeeResponse.from(employee);
    }

    // ==========================================
    // Employee: Get Own Profile
    // ==========================================

    @Transactional(readOnly = true)
    public EmployeeResponse getMyProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
        return EmployeeResponse.from(employee);
    }

    // ==========================================
    // Employee: Update Own Profile (restricted fields only)
    // ==========================================

    @Transactional
    public EmployeeResponse updateMyProfile(Authentication authentication, EmployeeProfileUpdateRequest request) {
        User user = getAuthenticatedUser(authentication);
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));

        // Only allowed fields
        if (request.phone() != null) employee.setPhone(request.phone());
        if (request.address() != null) employee.setAddress(request.address());
        if (request.profilePictureUrl() != null) employee.setProfilePictureUrl(request.profilePictureUrl());

        employee = employeeRepository.save(employee);
        log.info("Employee ID: {} updated own profile", employee.getId());
        return EmployeeResponse.from(employee);
    }

    // ==========================================
    // Helper
    // ==========================================

    private User getAuthenticatedUser(Authentication authentication) {
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return securityUser.getUser();
    }
}
