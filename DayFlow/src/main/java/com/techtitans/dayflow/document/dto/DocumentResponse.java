package com.techtitans.dayflow.document.dto;

import com.techtitans.dayflow.document.entity.Document;

import java.time.Instant;

public record DocumentResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String documentType,
        String fileName,
        String fileUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static DocumentResponse from(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getEmployee().getId(),
                document.getEmployee().getEmployeeCode(),
                document.getDocumentType(),
                document.getFileName(),
                document.getFileUrl(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
