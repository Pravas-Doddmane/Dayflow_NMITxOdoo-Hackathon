package com.techtitans.dayflow.document.controller;

import com.techtitans.dayflow.document.dto.DocumentResponse;
import com.techtitans.dayflow.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Employee document management")
public class DocumentController {

    private final DocumentService documentService;

    // ==========================================
    // Employee endpoint
    // ==========================================

    @GetMapping("/api/documents/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "View own documents")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(Authentication authentication) {
        return ResponseEntity.ok(documentService.getMyDocuments(authentication));
    }

    @GetMapping("/api/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @Operation(summary = "Download a document by ID")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocument(
            @PathVariable Long documentId,
            Authentication authentication) {
        com.techtitans.dayflow.document.entity.Document document = documentService.getDocumentOrThrow(documentId);
        org.springframework.core.io.Resource fileResource = documentService.loadDocumentFile(documentId, authentication);

        String filename = document.getFileName() != null ? document.getFileName() : "document.pdf";
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (filename.toLowerCase().endsWith(".pdf")) {
            mediaType = MediaType.APPLICATION_PDF;
        } else if (filename.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(fileResource);
    }

    // ==========================================
    // Admin endpoints
    // ==========================================

    @PostMapping(value = "/api/admin/documents/employee/{employeeId}",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload a document for an employee")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam String documentType,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocument(employeeId, documentType, file));
    }

    @GetMapping("/api/admin/documents/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all documents for an employee")
    public ResponseEntity<List<DocumentResponse>> getEmployeeDocuments(@PathVariable Long employeeId) {
        return ResponseEntity.ok(documentService.getEmployeeDocuments(employeeId));
    }

    @DeleteMapping("/api/admin/documents/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a document")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}
