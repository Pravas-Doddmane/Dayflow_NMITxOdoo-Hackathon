package com.techtitans.dayflow.document.service;

import com.techtitans.dayflow.common.exception.ForbiddenException;
import com.techtitans.dayflow.common.exception.ResourceNotFoundException;
import com.techtitans.dayflow.document.dto.DocumentResponse;
import com.techtitans.dayflow.document.entity.Document;
import com.techtitans.dayflow.document.repository.DocumentRepository;
import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.employee.repository.EmployeeRepository;
import com.techtitans.dayflow.security.SecurityUser;
import com.techtitans.dayflow.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final StorageService storageService;

    // ==========================================
    // Admin: Upload document for employee
    // ==========================================

    @Transactional
    public DocumentResponse uploadDocument(Long employeeId, String documentType, MultipartFile file) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        String fileUrl = storageService.store(file, "employee-" + employeeId);

        Document document = Document.builder()
                .employee(employee)
                .documentType(documentType)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .build();

        document = documentRepository.save(document);
        log.info("Uploaded document '{}' for employee ID: {}", documentType, employeeId);
        return DocumentResponse.from(document);
    }

    // ==========================================
    // Admin: Get employee documents
    // ==========================================

    @Transactional(readOnly = true)
    public List<DocumentResponse> getEmployeeDocuments(Long employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return documentRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(DocumentResponse::from).toList();
    }

    // ==========================================
    // Admin: Delete document
    // ==========================================

    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        storageService.delete(document.getFileUrl());
        documentRepository.delete(document);
        log.info("Deleted document ID: {}", documentId);
    }

    @Transactional(readOnly = true)
    public Document getDocumentOrThrow(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource loadDocumentFile(Long documentId, Authentication authentication) {
        Document document = getDocumentOrThrow(documentId);

        if (authentication != null && authentication.getPrincipal() instanceof SecurityUser securityUser) {
            User currentUser = securityUser.getUser();
            if (com.techtitans.dayflow.common.enums.RoleName.EMPLOYEE.equals(currentUser.getRole().getName())) {
                Employee employee = employeeRepository.findByUserId(currentUser.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
                if (!document.getEmployee().getId().equals(employee.getId())) {
                    throw new ForbiddenException("You are not authorized to download this document");
                }
            } else if (com.techtitans.dayflow.common.enums.RoleName.ADMIN.equals(currentUser.getRole().getName())) {
                if (currentUser.getCompany() != null && document.getEmployee().getCompany() != null) {
                    if (!currentUser.getCompany().getId().equals(document.getEmployee().getCompany().getId())) {
                        throw new ForbiddenException("Document belongs to another organization");
                    }
                }
            }
        }

        return storageService.loadAsResource(document.getFileUrl());
    }

    // ==========================================
    // Employee: View own documents
    // ==========================================

    @Transactional(readOnly = true)
    public List<DocumentResponse> getMyDocuments(Authentication authentication) {
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        User user = securityUser.getUser();

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        return documentRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
                .stream().map(DocumentResponse::from).toList();
    }
}
